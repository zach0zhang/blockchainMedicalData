# first-network多机部署（kafka共识）

## 前期准备

1. 物理环境：5台可通过网络进行通信的服务器，此处操作系统为Ubuntu 18.04

2. 在每一台服务器上都需要安装Fabric v1.4

3. 各机器上service部署情况如下表所示：

|    机器IP     |                         service列表                          |
| :-----------: | :----------------------------------------------------------: |
| 192.168.70.20 |        `zookeeper0`、`kafka0`、`orderer0.example.com`        |
| 192.168.70.21 |       `orderer1.example.com`、`peer0.org1.example.com`       |
| 192.168.70.22 | `zookeeper2`、`kafka2`、`orderer2.example.com`、`peer1.org1.example.com` |
| 192.168.70.43 |              `kafka3`、`peer0.org2.example.com`              |
| 192.168.70.44 |       `zookeeper1`、`kafka1`、`peer2.org2.example.com`       |

## 证书及通道配置文件

### `crypto-config.yaml`

1. `crypto-config.yaml`是一个网络拓扑文件。基于该文件，`Cryptogen`工具可以为组织及属于这些组织的组件生成一系列的证书及密钥。

2. 官方first-network中包括1个Orderer、2个Org和4个peer。此处我们多机部署（kafka共识）中需要3个Orderer，因此需要在`crypto-config.yaml`文件的`OrdererOrgs`下添加`Template`，修改后的`OrdererOrgs`如下所示：

   ```yaml
   OrdererOrgs:
     - Name: Orderer
       Domain: example.com
       Template:
         Count: 3
   ```

### `configtx.yaml`

1. `configtx.yaml`是一个对样例网络进行定义的文件。样例网络中有3个成员，包括1个`OrdererOrg`和2个Peer Orgs（`Org1`&`Org2`），每个Peer Orgs管理和维护两个peer节点。其还指定了一个联盟`SampleConsortium`，该联盟包括两个Peer Orgs。除此之外，"Profiles"章节应该被重点关注，其中有两个独一无二的headers，分别为`TwoOrgsOrdererGenesis`和`TwoOrgsChannel` ，在创建artifacts时需要传递这些headers作为参数。

2. 此处我们多机部署需要将solo共识改为kafka共识，因此需要在configtx.yaml文件中`Orderer: &OrdererDefaults`章节进行下列修改：

   - 将`OrdererType`的值更改为kafka
   - 更改`Addresses` ，这里我设置了3个orderer：orderer0、orderer1、orderer2
   - 更改`Kafka.Brokers`，这里我使用4台机器运行kafka。

3. `configtx.yamlx`相关修改结果如下所示：

   ```yaml
   OrdererType: kafka
   Addresses:
       - orderer0.example.com:7050
       - orderer1.example.com:7050
       - orderer2.example.com:7050
   Kafka:
      Brokers:
         - kafka0:9092
         - kafka1:9092
         - kafka2:9092
         - kafka3:9092
   ```

## Docker-compose配置文件

### `zookeeper`和`kafka`节点配置

1. 在`first-network/base`目录下添加`kafka-base.yaml`文件，`kafka-base.yaml`中包含zookeeper和kafka服务的基本配置，具体配置如下所示：

   - zookeeper服务

     ```yaml
     zookeeper:
       image: hyperledger/fabric-zookeeper
       restart: always
       ports:
         - 2181:2181
         - 2888:2888
         - 3888:3888
     ```

   - kafka服务

     ```yaml
     kafka:
       image: hyperledger/fabric-kafka
       restart: always
       environment:
         - KAFKA_LOG_RETENTION_MS=-1
         - KAFKA_MESSAGE_MAX_BYTES=103809024
         - KAFKA_REPLICA_FETCH_MAX_BYTES=103809024
         - KAFKA_UNCLEAN_LEADER_ELECTION_ENABLE=false
         - KAFKA_DEFAULT_REPLICATION_FACTOR=3
         - KAFKA_MIN_INSYNC_REPLICAS=2
       ports:
         - 9092:9092
     ```

2. 配置`zookeeper.yaml`

   - 根据zookeeper节点的数量，创建相应数量的`zookeeper.yaml`。此处我有3个zookeeper节点，对应创建了`zookeeper0.yaml`、`zookeeper1.yaml`和`zookeeper2.yaml`。

   - `zookeeper.yaml`使用`extends`来继承`base/kafka-base.yaml`中定义的zookeeper服务，目的是为了减少重复配置，以简化服务的配置。

   - `zookeeper.yaml`在`extra_hosts`中对所有zookeeper节点进行ip映射以使得zookeeper节点之间可以通过主机名进行通信，其中当前zookeeper节点的ip映射应设置为0.0.0.0。

   - `ZOO_MY_ID`是zookeeper节点在集群中的唯一标识，不可重复。此处3个zookeeper节点的`ZOO_MY_ID`依次为1、2、3。

   - 以`zookeeper0.yaml`为例，其内容如下所示：

     ```yaml
     zookeeper0:
       extends:
         file: base/kafka-base.yaml
         service: zookeeper
       container_name: zookeeper0
       environment:
         ZOO_MY_ID: 1
         ZOO_SERVERS:
            - server.1=zookeeper0:2888:3888
            - server.2=zookeeper1:2888:3888
            - server.3=zookeeper2:2888:3888
       extra_hosts:
         - "zookeeper0:0.0.0.0"
         - "zookeeper1:192.168.70.44"
         - "zookeeper2:192.168.70.22"
     ```

   - 要获得其他`zookeeper.yaml`，只需将`zookeeper0.yaml`中的`service`、`container_name`、`ZOO_MY_ID`、`extra_hosts`按照实际网络进行修改即可。

3. 配置`kafka.yaml`

   - 根据kafka节点的数量，创建相应数量的`kafka.yaml`。此处我有4个kafka节点，对应创建了`kafka0.yaml`、`kafka1.yaml`、`kafka2.yaml`和`kafka3.yaml`。

   - 与`zookeeper.yaml`配置类似，`kafka.yaml`使用`extends`来继承`base/kafka-base.yaml`中的kafka服务。

   - 必须设置`KAFKA_ADVERTISED_HOST_NAME`环境变量，若在`extra_hosts`中进行了当前kafka节点的IP映射，则其值为当前kafka节点的主机名，如`kafka0`；否则，其值为当前kafka节点的IP，如`192.168.70.20`。若不设置该环境变量，则orderer节点无法正确连接kafka节点，随之产生一系列问题。
   
   - `KAFKA_BROKER_ID`是kafka节点在集群中的唯一标识，不可重复。此处4个kafka节点的`KAFKA_BROKER_ID`依次为1、2、3、4。

   - 以`kafka0.yaml`为例，其内容如下所示：

     ```yaml
     kafka0:
       extends:
         file: base/kafka-base.yaml
         service: kafka
       container_name: kafka0
       environment:
         KAFKA_BROKER_ID: 1
         KAFKA_ADVERTISED_HOST_NAME: kafka0
         kAFKA_ZOOKEEPER_CONNECT: zookeeper0:2181,zookeeper1:2181,zookeeper2:2181
       extra_hosts:
         - "zookeeper0:192.168.70.20"
         - "zookeeper1:192.168.70.44"
         - "zookeeper2:192.168.70.22"
         - "kafka0:192.168.70.20"
         - "kafka1:192.168.70.44"
         - "kafka2:192.168.70.22"
         - "kafka3:192.168.70.43"
     ```

   - 要获得其他`kafka.yaml`，只需将`kafka0.yaml`中的`service`、`container_name`、`KAFKA_BROKER_ID`、`KAFKA_ADVERTISED_HOST_NAME` 、`KAFKA_ZOOKEEPER_CONNECT`、`extra_hosts`按照实际网络进行修改即可。

### `orderer`节点配置

1. 将`first-network/base`目录下`docker-compose-base.yaml`重命名为`orderer-base.yaml`，并进行以下修改：

   - 为方便调试，需将`FABRIC_LOGGING_SPEC` 值设置为DEBUG，且将`ORDERER_KAFKA_VERBOSE`的值设置为true。

   - fabric默认使用solo共识，此处想要使用kafka共识，需将`CONFIGTX_ORDERER_ORDERERTYPE`的值设置为kafka。

   - kafka共识需要使用多orderer节点，每个节点有其特定的volume、msp和tls，因此需要在具体的特定的orderer节点配置时进行特定orderer的volume、msp和tls数据目录映射。此处需要移除其中相应的映射。

   - 修改后`orderer-base.yaml`文件内容如下所示：

     ```yaml
     orderer-base:
       image: hyperledger/fabric-orderer
       restart: always
       environment:
         - FABRIC_LOGGING_SPEC=DEBUG
         - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
         - ORDERER_GENERAL_GENESISMETHOD=file
         - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
         - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
         - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
         # enabled TLS
         - ORDERER_GENERAL_TLS_ENABLED=true
         - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
         - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
         - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
         # consensus: kafka、solo
         - CONFIGTX_ORDERER_ORDERERTYPE=kafka
         - ORDERER_KAFKA_VERBOSE=true
       working_dir: /opt/gopath/src/github.com/hyperledger/fabric
       command: orderer
       volumes:
         - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
       ports:
         - 7050:7050
     ```

2. 配置`orderer.yaml`

   - 根据orderer节点的数量，创建相应数量的`orderer.yaml`。此处我有3个orderer节点，对应创建了`orderer0.yaml`、`orderer1.yaml`和`orderer2.yaml`。

   - 同样，`orderer.yaml`使用`extends`来继承`base/orderer-base.yaml`中的orderer-base服务。

   - 添加`ORDERER_HOST`和`CONFIGTX_ORDERER_KAFKA_BROKERS`环境变量。

   - 在`volumes`下添加特定orderer的volume、msp和tls数据目录映射。

   - 在`extra_hosts`中对所有kafka节点进行ip映射，从而使得orderer节点可以通过主机名与kafka节点进行通信。

   - 以`orderer0.yaml`为例，其中的orderer0.example.com服务内容如下所示：

     ```yaml
     orderer0.example.com:
       extends:
         file: base/orderer-base.yaml
         service: orderer-base
       container_name: orderer0.example.com
       environment:
         - ORDERER_HOST=orderer0.example.com
         - CONFIGTX_ORDERER_KAFKA_BROKERS=[kafka0:9092,kafka1:9092,kafka2:9092,kafka3:9092]
       volumes:
         - ./crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp:/var/hyperledger/orderer/msp
         - ./crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/:/var/hyperledger/orderer/tls
         - orderer0.example.com:/var/hyperledger/production/orderer
       extra_hosts:
         - "kafka0:192.168.70.20"
         - "kafka1:192.168.70.44"
         - "kafka2:192.168.70.22"
         - "kafka3:192.168.70.43"
     ```

### `peer`节点配置

1. 重写`first-network/base`目录下`peer-base.yaml`

   - 添加`CORE_PEER_MSPCONFIGPATH`环境变量。

   - 添加`volumes`，其中仅包括一个通用映射`- /var/run/:/host/var/run/`。

   - 在`extra_hosts`中对所有orderer节点进行ip映射，从而使得peer节点可以通过主机名与orderer节点进行通信。

   - 添加`ports`来进行端口映射，将容器的7051和7053端口与对应的主机端口进行映射。

   - 修改后`peer-base.yaml`文件中peer-base服务内容如下所示：

     ```yaml
     peer-base:
       image: hyperledger/fabric-peer
       restart: always
       environment:
         - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
         - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_byfn
         - FABRIC_LOGGING_SPEC=DEBUG
         - CORE_PEER_GOSSIP_USELEADERELECTION=true
         - CORE_PEER_GOSSIP_ORGLEADER=false
         - CORE_PEER_PROFILE_ENABLED=true
         - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
         # Configuring TLS for peers nodes
         - CORE_PEER_TLS_ENABLED=true
         - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
         - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
         - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
       working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
       command: peer node start
       extra_hosts:
         - "orderer0.example.com:192.168.70.20"
         - "orderer1.example.com:192.168.70.21"
         - "orderer2.example.com:192.168.70.22"
       volumes:
         - /var/run/:/host/var/run/
       ports:
         - 7051:7051
         - 7053:7053
     ```

2. 配置`peer.yaml`

   - 根据peer节点的数量，创建相应数量的`peer.yaml`。此处我有4个peer节点，对应创建了`peer0.yaml`、`peer1.yaml`、`peer2.yaml`和`peer3.yaml`。

   - 同样，`peer.yaml`使用`extends`来继承`base/peer-base.yaml`中的peer-base服务。

   - 在`volumes`下添加特定peer的volume、msp和tls数据目录映射。

   - 以`peer0.yaml`为例，其中的peer0.org1.example.com服务内容如下所示：

     ```yaml
     peer0.org1.example.com:
       extends:
         file: base/peer-base.yaml
         service: peer-base
       container_name: peer0.org1.example.com
       environment:
         - CORE_PEER_ID=peer0.org1.example.com
         - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
         - CORE_PEER_GOSSIP_BOOTSTRAP=peer1.org1.example.com:7051
         - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:7051
         - CORE_PEER_LOCALMSPID=Org1MSP
       volumes:
         - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/fabric/msp
         - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls:/etc/hyperledger/fabric/tls
         - peer0.org1.example.com:/var/hyperledger/production
       extra_hosts:
         - "peer1.org1.example.com:192.168.70.22"
         - "peer0.org2.example.com:192.168.70.43"
         - "peer1.org2.example.com:192.168.70.44"	
     ```

## 启动多节点集群

|    机器IP     | 执行的命令                                                   |
| :-----------: | :----------------------------------------------------------- |
| 192.168.70.20 | `docker-compose -f zookeeper0.yaml -f kafka0.yaml -f orderer0.yaml up -d` |
| 192.168.70.21 | `docker-compose -f orderer1.yaml -f peer0.yaml up -d`        |
| 192.168.70.22 | `docker-compose -f zookeeper2.yaml -f kafka2.yaml -f orderer2.yaml -f peer1.yaml up -d` |
| 192.168.70.43 | `docker-compose -f kafka3.yaml -f peer2.yaml up -d`          |
| 192.168.70.44 | `docker-compose -f zookeeper1.yaml -f kafka1.yaml -f peer3.yaml up -d` |
