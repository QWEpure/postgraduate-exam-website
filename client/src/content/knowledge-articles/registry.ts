import type { KnowledgePoint } from '@/types'
import { dnsQueryArticle } from './computer-networks/application-layer/dns-query'
import { ftpArticle } from './computer-networks/application-layer/ftp'
import { emailArticle } from './computer-networks/application-layer/email'
import { httpConnectionCacheArticle } from './computer-networks/application-layer/http-connection-cache'
import { parityCheckCodeArticle } from './computer-networks/data-link-layer/parity-check-code'
import { crcArticle } from './computer-networks/data-link-layer/crc'
import { hammingCodeArticle } from './computer-networks/data-link-layer/hamming-code'
import { stopWaitProtocolArticle } from './computer-networks/data-link-layer/stop-wait-protocol'
import { goBackNArticle } from './computer-networks/data-link-layer/go-back-n'
import { selectiveRepeatArticle } from './computer-networks/data-link-layer/selective-repeat-protocol'
import { protocolComparisonArticle } from './computer-networks/data-link-layer/protocol-comparison'
import { multiplexingArticle } from './computer-networks/data-link-layer/multiplexing'
import { alohaArticle } from './computer-networks/data-link-layer/aloha-protocol'
import { csmaArticle } from './computer-networks/data-link-layer/csma-protocol'
import { csmaCdArticle } from './computer-networks/data-link-layer/csma-cd'
import { csmaCaArticle } from './computer-networks/data-link-layer/csma-ca-protocol'
import { ethernetTokenRingArticle } from './computer-networks/data-link-layer/ethernet-token-ring'
import { lanFrameArticle } from './computer-networks/data-link-layer/local-area-network-frame'
import { vlanArticle } from './computer-networks/data-link-layer/vlan'
import { hdlcPppArticle } from './computer-networks/data-link-layer/hdlc-ppp'
import { switchingDeviceArticle } from './computer-networks/data-link-layer/switching-device'
import { bridgeArticle } from './computer-networks/data-link-layer/bridge'
import { delayBandwidthProductArticle } from './computer-networks/network-architecture/delay-bandwidth-product'
import { protocolServiceInterfaceArticle } from './computer-networks/network-architecture/protocol-service-interface'
import { rateBandwidthThroughputArticle } from './computer-networks/network-architecture/rate-bandwidth-throughput'
import { rttChannelUtilizationArticle } from './computer-networks/network-architecture/rtt-channel-utilization'
import { tcpIpOsiArticle } from './computer-networks/network-architecture/tcp-ip-osi'
import { ipAddressArticle } from './computer-networks/network-layer/ip-address'
import { subnetArticle } from './computer-networks/network-layer/subnet'
import { ipv4Article } from './computer-networks/network-layer/ipv4'
import { ipv6Article } from './computer-networks/network-layer/ipv6'
import { ipExtensionArticle } from './computer-networks/network-layer/ip-extension'
import { arpArticle } from './computer-networks/network-layer/arp'
import { icmpArticle } from './computer-networks/network-layer/icmp'
import { dhcpArticle } from './computer-networks/network-layer/dhcp'
import { ripArticle } from './computer-networks/network-layer/rip'
import { ospfArticle } from './computer-networks/network-layer/ospf'
import { bgpArticle } from './computer-networks/network-layer/bgp'
import { routerArticle } from './computer-networks/network-layer/router'
import { nyquistShannonArticle } from './computer-networks/physical-layer/nyquist-shannon'
import { dataSignalBaudArticle } from './computer-networks/physical-layer/data-signal-baud'
import { switchingArticle } from './computer-networks/physical-layer/switching'
import { encodingArticle } from './computer-networks/physical-layer/encoding'
import { digitalAnalogArticle } from './computer-networks/physical-layer/digital-analog'
import { transportMediumArticle } from './computer-networks/physical-layer/transport-medium'
import { physicalLayerDevicesArticle } from './computer-networks/physical-layer/physical-layer-devices'
import { tcpThreeWayHandshakeArticle } from './computer-networks/transport-layer/tcp-three-way-handshake'
import { tcpHeaderArticle } from './computer-networks/transport-layer/tcp-header'
import { tcpReliableArticle } from './computer-networks/transport-layer/tcp-reliable-transmission'
import { tcpFlowControlArticle } from './computer-networks/transport-layer/tcp-flow-control'
import { udpHeaderArticle } from './computer-networks/transport-layer/udp-header'
import { udpChecksumArticle } from './computer-networks/transport-layer/udp-checksum'
import { ds1_1BasicsArticle } from './data-structures/ds-1-1-basics'
import { ds1_2TimeComplexityArticle } from './data-structures/ds-1-2-time-complexity'
import { ds1_3SpaceComplexityArticle } from './data-structures/ds-1-3-space-complexity'
import { ds2_1ConceptArticle } from './data-structures/ds-2-1-concept'
import { ds2_2SequentialListArticle } from './data-structures/ds-2-2-sequential-list'
import { ds2_3SinglyLinkedListArticle } from './data-structures/ds-2-3-singly-linked-list'
import { ds2_4DoubleCircularStaticListArticle } from './data-structures/ds-2-4-double-circular-static-list'
import { ds2_5ApplicationArticle } from './data-structures/ds-2-5-application'
import { ds3_1StackArticle } from './data-structures/ds-3-1-stack'
import { ds3_2StackApplicationArticle } from './data-structures/ds-3-2-stack-application'
import { ds3_3QueueArticle } from './data-structures/ds-3-3-queue'
import { ds3_4QueueApplicationArticle } from './data-structures/ds-3-4-queue-application'
import { ds3_5MatrixCompressionArticle } from './data-structures/ds-3-5-matrix-compression'
import { ds4_1StringBasicArticle } from './data-structures/ds-4-1-string-basic'
import { ds4_2KmpArticle } from './data-structures/ds-4-2-kmp'
import { ds4_3KmpImprovedArticle } from './data-structures/ds-4-3-kmp-improved'
import { ds5_1TreeConceptArticle } from './data-structures/ds-5-1-tree-concept'
import { ds5_2BinaryTreeConceptArticle } from './data-structures/ds-5-2-binary-tree-concept'
import { ds5_3BinaryTreeStoreTraverseArticle } from './data-structures/ds-5-3-binary-tree-store-traverse'
import { ds5_4ThreadedBinaryTreeArticle } from './data-structures/ds-5-4-threaded-binary-tree'
import { ds5_5TreeForestArticle } from './data-structures/ds-5-5-tree-forest'
import { ds5_6HuffmanArticle } from './data-structures/ds-5-6-huffman'
import { ds5_7BstArticle } from './data-structures/ds-5-7-bst'
import { ds5_8AvlArticle } from './data-structures/ds-5-8-avl'
import { ds6_1GraphConceptArticle } from './data-structures/ds-6-1-graph-concept'
import { ds6_2GraphStoreArticle } from './data-structures/ds-6-2-graph-store'
import { ds6_3GraphTraverseArticle } from './data-structures/ds-6-3-graph-traverse'
import { ds6_4MstArticle } from './data-structures/ds-6-4-mst'
import { ds6_5ShortestPathArticle } from './data-structures/ds-6-5-shortest-path'
import { ds6_6TopologicalArticle } from './data-structures/ds-6-6-topological'
import { ds6_7CriticalPathArticle } from './data-structures/ds-6-7-critical-path'
import { ds7_2SequentialSearchArticle } from './data-structures/ds-7-2-sequential-search'
import { ds7_3BinarySearchArticle } from './data-structures/ds-7-3-binary-search'
import { ds7_4BlockSearchArticle } from './data-structures/ds-7-4-block-search'
import { ds7_5BTreeArticle } from './data-structures/ds-7-5-b-tree'
import { ds7_6BPlusTreeArticle } from './data-structures/ds-7-6-b-plus-tree'
import { ds7_7HashArticle } from './data-structures/ds-7-7-hash'
import { ds7_8TreeSearchArticle } from './data-structures/ds-7-8-tree-search'
import { ds8_1SortConceptArticle } from './data-structures/ds-8-1-sort-concept'
import { ds8_2InternalSortArticle } from './data-structures/ds-8-2-internal-sort'
import { ds8_7SortComparisonArticle } from './data-structures/ds-8-7-sort-comparison'
import { ds8_8ExternalSortArticle } from './data-structures/ds-8-8-external-sort'
import { von_neumannArticle } from './computer-organization/von-neumann'
import { sourceToLoadArticle } from './computer-organization/source-to-load'
import { isaArticle } from './computer-organization/isa'
import { performanceArticle } from './computer-organization/performance'
import { wordLengthArticle } from './computer-organization/word-length'
import { base_conversionArticle } from './computer-organization/number-representation/base-conversion'
import { codeArticle } from './computer-organization/number-representation/code'
import { ieee754Article } from './computer-organization/floating-point/ieee754'
import { floatOpsArticle } from './computer-organization/floating-point/ops'
import { aluArticle } from './computer-organization/arithmetic/alu'
import { arithmeticMethodsArticle } from './computer-organization/arithmetic/arithmetic-methods'
import { memory_hierarchyArticle } from './computer-organization/memory-hierarchy'
import { sramDramArticle } from './computer-organization/sram-dram'
import { multiModuleArticle } from './computer-organization/multi-module'
import { memoryExpandArticle } from './computer-organization/memory-expand'
import { coCacheBasicsArticle } from './computer-organization/co-cache-basics'
import { coCacheReplaceWriteArticle } from './computer-organization/co-cache-replace-write'
import { coCachePerformanceArticle } from './computer-organization/co-cache-performance'
import { coVmBasicsArticle } from './computer-organization/co-vm-basics'
import { coVmImplArticle } from './computer-organization/co-vm-impl'
import { coExternalHddArticle } from './computer-organization/co-external-hdd'
import { coExternalSsdArticle } from './computer-organization/co-external-ssd'
import { instruction_formatArticle } from './computer-organization/instruction-format'
import { addressingArticle } from './computer-organization/addressing'
import { alignmentArticle } from './computer-organization/alignment'
import { datapathArticle } from './computer-organization/datapath'
import { executeArticle } from './computer-organization/execute'
import { controllerArticle } from './computer-organization/controller'
import { pipelineArticle } from './computer-organization/pipeline'
import { multicoreArticle } from './computer-organization/multicore'
import { busArticle } from './computer-organization/bus'
import { io_methodArticle } from './computer-organization/io-method'
import { interruptArticle } from './computer-organization/interrupt'
import { featuresArticle } from './operating-systems/features'
import { functionsArticle } from './operating-systems/functions'
import { classificationArticle } from './operating-systems/classification'
import { bootArticle } from './operating-systems/boot'
import { virtualMachineArticle } from './operating-systems/virtual-machine'
import { processArticle } from './operating-systems/process'
import { threadArticle } from './operating-systems/thread'
import { scheduleArticle } from './operating-systems/schedule'
import { syncArticle } from './operating-systems/sync'
import { deadlockArticle } from './operating-systems/deadlock'
import { contiguousAllocationArticle } from './operating-systems/contiguous-allocation'
import { noncontiguousAllocationArticle } from './operating-systems/noncontiguous-allocation'
import { fileFcbArticle } from './operating-systems/file-fcb'
import { fileOperationsArticle } from './operating-systems/file-operations'
import { fileLogicalArticle } from './operating-systems/file-logical'
import { filePhysicalArticle } from './operating-systems/file-physical'
import { directoryConceptArticle } from './operating-systems/directory-concept'
import { filesystemSpaceArticle } from './operating-systems/filesystem-space'
import { filesystemVfsArticle } from './operating-systems/filesystem-vfs'
import { bufferArticle } from './operating-systems/buffer'
import type { KnowledgeArticleData } from './types'

export type KnowledgeArticleRegistration = {
  article: KnowledgeArticleData
  directory: string
  fileName: string
  exportName: string
}

/**
 * 这里只登记 KnowledgePoint 与文章文件的对应关系。
 * 新增页面时，在对应书目/章节目录创建一个文件，再在此注册即可。
 */
const knowledgeArticleRegistry: Record<string, KnowledgeArticleRegistration> = {
  [tcpIpOsiArticle.pointId]: {
    article: tcpIpOsiArticle,
    directory: 'computer-networks/network-architecture',
    fileName: 'tcp-ip-osi.ts',
    exportName: 'tcpIpOsiArticle',
  },
  [protocolServiceInterfaceArticle.pointId]: {
    article: protocolServiceInterfaceArticle,
    directory: 'computer-networks/network-architecture',
    fileName: 'protocol-service-interface.ts',
    exportName: 'protocolServiceInterfaceArticle',
  },
  [rateBandwidthThroughputArticle.pointId]: {
    article: rateBandwidthThroughputArticle,
    directory: 'computer-networks/network-architecture',
    fileName: 'rate-bandwidth-throughput.ts',
    exportName: 'rateBandwidthThroughputArticle',
  },
  [delayBandwidthProductArticle.pointId]: {
    article: delayBandwidthProductArticle,
    directory: 'computer-networks/network-architecture',
    fileName: 'delay-bandwidth-product.ts',
    exportName: 'delayBandwidthProductArticle',
  },
  [rttChannelUtilizationArticle.pointId]: {
    article: rttChannelUtilizationArticle,
    directory: 'computer-networks/network-architecture',
    fileName: 'rtt-channel-utilization.ts',
    exportName: 'rttChannelUtilizationArticle',
  },
  [nyquistShannonArticle.pointId]: {
    article: nyquistShannonArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'nyquist-shannon.ts',
    exportName: 'nyquistShannonArticle',
  },
  [dataSignalBaudArticle.pointId]: {
    article: dataSignalBaudArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'data-signal-baud.ts',
    exportName: 'dataSignalBaudArticle',
  },
  [switchingArticle.pointId]: {
    article: switchingArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'switching.ts',
    exportName: 'switchingArticle',
  },
  [encodingArticle.pointId]: {
    article: encodingArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'encoding.ts',
    exportName: 'encodingArticle',
  },
  [digitalAnalogArticle.pointId]: {
    article: digitalAnalogArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'digital-analog.ts',
    exportName: 'digitalAnalogArticle',
  },
  [transportMediumArticle.pointId]: {
    article: transportMediumArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'transport-medium.ts',
    exportName: 'transportMediumArticle',
  },
  [physicalLayerDevicesArticle.pointId]: {
    article: physicalLayerDevicesArticle,
    directory: 'computer-networks/physical-layer',
    fileName: 'physical-layer-devices.ts',
    exportName: 'physicalLayerDevicesArticle',
  },
  [parityCheckCodeArticle.pointId]: {
    article: parityCheckCodeArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'parity-check-code.ts',
    exportName: 'parityCheckCodeArticle',
  },
  [crcArticle.pointId]: {
    article: crcArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'crc.ts',
    exportName: 'crcArticle',
  },
  [hammingCodeArticle.pointId]: {
    article: hammingCodeArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'hamming-code.ts',
    exportName: 'hammingCodeArticle',
  },
  [stopWaitProtocolArticle.pointId]: {
    article: stopWaitProtocolArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'stop-wait-protocol.ts',
    exportName: 'stopWaitProtocolArticle',
  },
  [goBackNArticle.pointId]: {
    article: goBackNArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'go-back-n.ts',
    exportName: 'goBackNArticle',
  },
  [selectiveRepeatArticle.pointId]: {
    article: selectiveRepeatArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'selective-repeat-protocol.ts',
    exportName: 'selectiveRepeatArticle',
  },
  [protocolComparisonArticle.pointId]: {
    article: protocolComparisonArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'protocol-comparison.ts',
    exportName: 'protocolComparisonArticle',
  },
  [multiplexingArticle.pointId]: {
    article: multiplexingArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'multiplexing.ts',
    exportName: 'multiplexingArticle',
  },
  [alohaArticle.pointId]: {
    article: alohaArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'aloha-protocol.ts',
    exportName: 'alohaArticle',
  },
  [csmaArticle.pointId]: {
    article: csmaArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'csma-protocol.ts',
    exportName: 'csmaArticle',
  },
  [csmaCdArticle.pointId]: {
    article: csmaCdArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'csma-cd.ts',
    exportName: 'csmaCdArticle',
  },
  [csmaCaArticle.pointId]: {
    article: csmaCaArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'csma-ca-protocol.ts',
    exportName: 'csmaCaArticle',
  },
  [ethernetTokenRingArticle.pointId]: {
    article: ethernetTokenRingArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'ethernet-token-ring.ts',
    exportName: 'ethernetTokenRingArticle',
  },
  [lanFrameArticle.pointId]: {
    article: lanFrameArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'local-area-network-frame.ts',
    exportName: 'lanFrameArticle',
  },
  [vlanArticle.pointId]: {
    article: vlanArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'vlan.ts',
    exportName: 'vlanArticle',
  },
  [hdlcPppArticle.pointId]: {
    article: hdlcPppArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'hdlc-ppp.ts',
    exportName: 'hdlcPppArticle',
  },
  [switchingDeviceArticle.pointId]: {
    article: switchingDeviceArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'switching-device.ts',
    exportName: 'switchingDeviceArticle',
  },
  [bridgeArticle.pointId]: {
    article: bridgeArticle,
    directory: 'computer-networks/data-link-layer',
    fileName: 'bridge.ts',
    exportName: 'bridgeArticle',
  },
  [ipAddressArticle.pointId]: {
    article: ipAddressArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'ip-address.ts',
    exportName: 'ipAddressArticle',
  },
  [subnetArticle.pointId]: {
    article: subnetArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'subnet.ts',
    exportName: 'subnetArticle',
  },
  [ipv4Article.pointId]: {
    article: ipv4Article,
    directory: 'computer-networks/network-layer',
    fileName: 'ipv4.ts',
    exportName: 'ipv4Article',
  },
  [ipv6Article.pointId]: {
    article: ipv6Article,
    directory: 'computer-networks/network-layer',
    fileName: 'ipv6.ts',
    exportName: 'ipv6Article',
  },
  [ipExtensionArticle.pointId]: {
    article: ipExtensionArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'ip-extension.ts',
    exportName: 'ipExtensionArticle',
  },
  [arpArticle.pointId]: {
    article: arpArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'arp.ts',
    exportName: 'arpArticle',
  },
  [icmpArticle.pointId]: {
    article: icmpArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'icmp.ts',
    exportName: 'icmpArticle',
  },
  [dhcpArticle.pointId]: {
    article: dhcpArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'dhcp.ts',
    exportName: 'dhcpArticle',
  },
  [ripArticle.pointId]: {
    article: ripArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'rip.ts',
    exportName: 'ripArticle',
  },
  [ospfArticle.pointId]: {
    article: ospfArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'ospf.ts',
    exportName: 'ospfArticle',
  },
  [bgpArticle.pointId]: {
    article: bgpArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'bgp.ts',
    exportName: 'bgpArticle',
  },
  [routerArticle.pointId]: {
    article: routerArticle,
    directory: 'computer-networks/network-layer',
    fileName: 'router.ts',
    exportName: 'routerArticle',
  },
  [tcpHeaderArticle.pointId]: {
    article: tcpHeaderArticle,
    directory: 'computer-networks/transport-layer',
    fileName: 'tcp-header.ts',
    exportName: 'tcpHeaderArticle',
  },
  [tcpThreeWayHandshakeArticle.pointId]: {
    article: tcpThreeWayHandshakeArticle,
    directory: 'computer-networks/transport-layer',
    fileName: 'tcp-three-way-handshake.ts',
    exportName: 'tcpThreeWayHandshakeArticle',
  },
  [tcpReliableArticle.pointId]: {
    article: tcpReliableArticle,
    directory: 'computer-networks/transport-layer',
    fileName: 'tcp-reliable-transmission.ts',
    exportName: 'tcpReliableArticle',
  },
  [tcpFlowControlArticle.pointId]: {
    article: tcpFlowControlArticle,
    directory: 'computer-networks/transport-layer',
    fileName: 'tcp-flow-control.ts',
    exportName: 'tcpFlowControlArticle',
  },
  [udpHeaderArticle.pointId]: {
    article: udpHeaderArticle,
    directory: 'computer-networks/transport-layer',
    fileName: 'udp-header.ts',
    exportName: 'udpHeaderArticle',
  },
  [udpChecksumArticle.pointId]: {
    article: udpChecksumArticle,
    directory: 'computer-networks/transport-layer',
    fileName: 'udp-checksum.ts',
    exportName: 'udpChecksumArticle',
  },
  [dnsQueryArticle.pointId]: {
    article: dnsQueryArticle,
    directory: 'computer-networks/application-layer',
    fileName: 'dns-query.ts',
    exportName: 'dnsQueryArticle',
  },
  [httpConnectionCacheArticle.pointId]: {
    article: httpConnectionCacheArticle,
    directory: 'computer-networks/application-layer',
    fileName: 'http-connection-cache.ts',
    exportName: 'httpConnectionCacheArticle',
  },
  [ftpArticle.pointId]: {
    article: ftpArticle,
    directory: 'computer-networks/application-layer',
    fileName: 'ftp.ts',
    exportName: 'ftpArticle',
  },
  [emailArticle.pointId]: {
    article: emailArticle,
    directory: 'computer-networks/application-layer',
    fileName: 'email.ts',
    exportName: 'emailArticle',
  },

  [ds1_1BasicsArticle.pointId]: {
    article: ds1_1BasicsArticle,
    directory: 'data-structures',
    fileName: 'ds-1-1-basics.ts',
    exportName: 'ds1_1BasicsArticle',
  },
  [ds1_2TimeComplexityArticle.pointId]: {
    article: ds1_2TimeComplexityArticle,
    directory: 'data-structures',
    fileName: 'ds-1-2-time-complexity.ts',
    exportName: 'ds1_2TimeComplexityArticle',
  },
  [ds1_3SpaceComplexityArticle.pointId]: {
    article: ds1_3SpaceComplexityArticle,
    directory: 'data-structures',
    fileName: 'ds-1-3-space-complexity.ts',
    exportName: 'ds1_3SpaceComplexityArticle',
  },
  [ds2_1ConceptArticle.pointId]: {
    article: ds2_1ConceptArticle,
    directory: 'data-structures',
    fileName: 'ds-2-1-concept.ts',
    exportName: 'ds2_1ConceptArticle',
  },
  [ds2_2SequentialListArticle.pointId]: {
    article: ds2_2SequentialListArticle,
    directory: 'data-structures',
    fileName: 'ds-2-2-sequential-list.ts',
    exportName: 'ds2_2SequentialListArticle',
  },
  [ds2_3SinglyLinkedListArticle.pointId]: {
    article: ds2_3SinglyLinkedListArticle,
    directory: 'data-structures',
    fileName: 'ds-2-3-singly-linked-list.ts',
    exportName: 'ds2_3SinglyLinkedListArticle',
  },
  [ds2_4DoubleCircularStaticListArticle.pointId]: {
    article: ds2_4DoubleCircularStaticListArticle,
    directory: 'data-structures',
    fileName: 'ds-2-4-double-circular-static-list.ts',
    exportName: 'ds2_4DoubleCircularStaticListArticle',
  },
  [ds2_5ApplicationArticle.pointId]: {
    article: ds2_5ApplicationArticle,
    directory: 'data-structures',
    fileName: 'ds-2-5-application.ts',
    exportName: 'ds2_5ApplicationArticle',
  },
  [ds3_1StackArticle.pointId]: {
    article: ds3_1StackArticle,
    directory: 'data-structures',
    fileName: 'ds-3-1-stack.ts',
    exportName: 'ds3_1StackArticle',
  },
  [ds3_2StackApplicationArticle.pointId]: {
    article: ds3_2StackApplicationArticle,
    directory: 'data-structures',
    fileName: 'ds-3-2-stack-application.ts',
    exportName: 'ds3_2StackApplicationArticle',
  },
  [ds3_3QueueArticle.pointId]: {
    article: ds3_3QueueArticle,
    directory: 'data-structures',
    fileName: 'ds-3-3-queue.ts',
    exportName: 'ds3_3QueueArticle',
  },
  [ds3_4QueueApplicationArticle.pointId]: {
    article: ds3_4QueueApplicationArticle,
    directory: 'data-structures',
    fileName: 'ds-3-4-queue-application.ts',
    exportName: 'ds3_4QueueApplicationArticle',
  },
  [ds3_5MatrixCompressionArticle.pointId]: {
    article: ds3_5MatrixCompressionArticle,
    directory: 'data-structures',
    fileName: 'ds-3-5-matrix-compression.ts',
    exportName: 'ds3_5MatrixCompressionArticle',
  },
  [ds4_1StringBasicArticle.pointId]: {
    article: ds4_1StringBasicArticle,
    directory: 'data-structures',
    fileName: 'ds-4-1-string-basic.ts',
    exportName: 'ds4_1StringBasicArticle',
  },
  [ds4_2KmpArticle.pointId]: {
    article: ds4_2KmpArticle,
    directory: 'data-structures',
    fileName: 'ds-4-2-kmp.ts',
    exportName: 'ds4_2KmpArticle',
  },
  [ds4_3KmpImprovedArticle.pointId]: {
    article: ds4_3KmpImprovedArticle,
    directory: 'data-structures',
    fileName: 'ds-4-3-kmp-improved.ts',
    exportName: 'ds4_3KmpImprovedArticle',
  },
  [ds5_1TreeConceptArticle.pointId]: {
    article: ds5_1TreeConceptArticle,
    directory: 'data-structures',
    fileName: 'ds-5-1-tree-concept.ts',
    exportName: 'ds5_1TreeConceptArticle',
  },
  [ds5_2BinaryTreeConceptArticle.pointId]: {
    article: ds5_2BinaryTreeConceptArticle,
    directory: 'data-structures',
    fileName: 'ds-5-2-binary-tree-concept.ts',
    exportName: 'ds5_2BinaryTreeConceptArticle',
  },
  [ds5_3BinaryTreeStoreTraverseArticle.pointId]: {
    article: ds5_3BinaryTreeStoreTraverseArticle,
    directory: 'data-structures',
    fileName: 'ds-5-3-binary-tree-store-traverse.ts',
    exportName: 'ds5_3BinaryTreeStoreTraverseArticle',
  },
  [ds5_4ThreadedBinaryTreeArticle.pointId]: {
    article: ds5_4ThreadedBinaryTreeArticle,
    directory: 'data-structures',
    fileName: 'ds-5-4-threaded-binary-tree.ts',
    exportName: 'ds5_4ThreadedBinaryTreeArticle',
  },
  [ds5_5TreeForestArticle.pointId]: {
    article: ds5_5TreeForestArticle,
    directory: 'data-structures',
    fileName: 'ds-5-5-tree-forest.ts',
    exportName: 'ds5_5TreeForestArticle',
  },
  [ds5_6HuffmanArticle.pointId]: {
    article: ds5_6HuffmanArticle,
    directory: 'data-structures',
    fileName: 'ds-5-6-huffman.ts',
    exportName: 'ds5_6HuffmanArticle',
  },
  [ds5_7BstArticle.pointId]: {
    article: ds5_7BstArticle,
    directory: 'data-structures',
    fileName: 'ds-5-7-bst.ts',
    exportName: 'ds5_7BstArticle',
  },
  [ds5_8AvlArticle.pointId]: {
    article: ds5_8AvlArticle,
    directory: 'data-structures',
    fileName: 'ds-5-8-avl.ts',
    exportName: 'ds5_8AvlArticle',
  },
  [ds6_1GraphConceptArticle.pointId]: {
    article: ds6_1GraphConceptArticle,
    directory: 'data-structures',
    fileName: 'ds-6-1-graph-concept.ts',
    exportName: 'ds6_1GraphConceptArticle',
  },
  [ds6_2GraphStoreArticle.pointId]: {
    article: ds6_2GraphStoreArticle,
    directory: 'data-structures',
    fileName: 'ds-6-2-graph-store.ts',
    exportName: 'ds6_2GraphStoreArticle',
  },
  [ds6_3GraphTraverseArticle.pointId]: {
    article: ds6_3GraphTraverseArticle,
    directory: 'data-structures',
    fileName: 'ds-6-3-graph-traverse.ts',
    exportName: 'ds6_3GraphTraverseArticle',
  },
  [ds6_4MstArticle.pointId]: {
    article: ds6_4MstArticle,
    directory: 'data-structures',
    fileName: 'ds-6-4-mst.ts',
    exportName: 'ds6_4MstArticle',
  },
  [ds6_5ShortestPathArticle.pointId]: {
    article: ds6_5ShortestPathArticle,
    directory: 'data-structures',
    fileName: 'ds-6-5-shortest-path.ts',
    exportName: 'ds6_5ShortestPathArticle',
  },
  [ds6_6TopologicalArticle.pointId]: {
    article: ds6_6TopologicalArticle,
    directory: 'data-structures',
    fileName: 'ds-6-6-topological.ts',
    exportName: 'ds6_6TopologicalArticle',
  },
  [ds6_7CriticalPathArticle.pointId]: {
    article: ds6_7CriticalPathArticle,
    directory: 'data-structures',
    fileName: 'ds-6-7-critical-path.ts',
    exportName: 'ds6_7CriticalPathArticle',
  },
  [ds7_2SequentialSearchArticle.pointId]: {
    article: ds7_2SequentialSearchArticle,
    directory: 'data-structures',
    fileName: 'ds-7-2-sequential-search.ts',
    exportName: 'ds7_2SequentialSearchArticle',
  },
  [ds7_3BinarySearchArticle.pointId]: {
    article: ds7_3BinarySearchArticle,
    directory: 'data-structures',
    fileName: 'ds-7-3-binary-search.ts',
    exportName: 'ds7_3BinarySearchArticle',
  },
  [ds7_4BlockSearchArticle.pointId]: {
    article: ds7_4BlockSearchArticle,
    directory: 'data-structures',
    fileName: 'ds-7-4-block-search.ts',
    exportName: 'ds7_4BlockSearchArticle',
  },
  [ds7_5BTreeArticle.pointId]: {
    article: ds7_5BTreeArticle,
    directory: 'data-structures',
    fileName: 'ds-7-5-b-tree.ts',
    exportName: 'ds7_5BTreeArticle',
  },
  [ds7_6BPlusTreeArticle.pointId]: {
    article: ds7_6BPlusTreeArticle,
    directory: 'data-structures',
    fileName: 'ds-7-6-b-plus-tree.ts',
    exportName: 'ds7_6BPlusTreeArticle',
  },
  [ds7_7HashArticle.pointId]: {
    article: ds7_7HashArticle,
    directory: 'data-structures',
    fileName: 'ds-7-7-hash.ts',
    exportName: 'ds7_7HashArticle',
  },
  [ds7_8TreeSearchArticle.pointId]: {
    article: ds7_8TreeSearchArticle,
    directory: 'data-structures',
    fileName: 'ds-7-8-tree-search.ts',
    exportName: 'ds7_8TreeSearchArticle',
  },
  [ds8_1SortConceptArticle.pointId]: {
    article: ds8_1SortConceptArticle,
    directory: 'data-structures',
    fileName: 'ds-8-1-sort-concept.ts',
    exportName: 'ds8_1SortConceptArticle',
  },
  [ds8_2InternalSortArticle.pointId]: {
    article: ds8_2InternalSortArticle,
    directory: 'data-structures',
    fileName: 'ds-8-2-internal-sort.ts',
    exportName: 'ds8_2InternalSortArticle',
  },
  [ds8_7SortComparisonArticle.pointId]: {
    article: ds8_7SortComparisonArticle,
    directory: 'data-structures',
    fileName: 'ds-8-7-sort-comparison.ts',
    exportName: 'ds8_7SortComparisonArticle',
  },
  [ds8_8ExternalSortArticle.pointId]: {
    article: ds8_8ExternalSortArticle,
    directory: 'data-structures',
    fileName: 'ds-8-8-external-sort.ts',
    exportName: 'ds8_8ExternalSortArticle',
  },
  [von_neumannArticle.pointId]: {
    article: von_neumannArticle,
    directory: 'computer-organization',
    fileName: 'von-neumann.ts',
    exportName: 'von_neumannArticle',
  },
  [sourceToLoadArticle.pointId]: {
    article: sourceToLoadArticle,
    directory: 'computer-organization',
    fileName: 'source-to-load.ts',
    exportName: 'sourceToLoadArticle',
  },
  [isaArticle.pointId]: {
    article: isaArticle,
    directory: 'computer-organization',
    fileName: 'isa.ts',
    exportName: 'isaArticle',
  },
  [performanceArticle.pointId]: {
    article: performanceArticle,
    directory: 'computer-organization',
    fileName: 'performance.ts',
    exportName: 'performanceArticle',
  },
  [wordLengthArticle.pointId]: {
    article: wordLengthArticle,
    directory: 'computer-organization',
    fileName: 'word-length.ts',
    exportName: 'wordLengthArticle',
  },
  [base_conversionArticle.pointId]: {
    article: base_conversionArticle,
    directory: 'computer-organization/number-representation',
    fileName: 'base-conversion.ts',
    exportName: 'base_conversionArticle',
  },
  [codeArticle.pointId]: {
    article: codeArticle,
    directory: 'computer-organization/number-representation',
    fileName: 'code.ts',
    exportName: 'codeArticle',
  },
  [ieee754Article.pointId]: {
    article: ieee754Article,
    directory: 'computer-organization/floating-point',
    fileName: 'ieee754.ts',
    exportName: 'ieee754Article',
  },
  [floatOpsArticle.pointId]: {
    article: floatOpsArticle,
    directory: 'computer-organization/floating-point',
    fileName: 'ops.ts',
    exportName: 'floatOpsArticle',
  },
  [aluArticle.pointId]: {
    article: aluArticle,
    directory: 'computer-organization/arithmetic',
    fileName: 'alu.ts',
    exportName: 'aluArticle',
  },
  [arithmeticMethodsArticle.pointId]: {
    article: arithmeticMethodsArticle,
    directory: 'computer-organization/arithmetic',
    fileName: 'arithmetic-methods.ts',
    exportName: 'arithmeticMethodsArticle',
  },
  [memory_hierarchyArticle.pointId]: {
    article: memory_hierarchyArticle,
    directory: 'computer-organization',
    fileName: 'memory-hierarchy.ts',
    exportName: 'memory_hierarchyArticle',
  },
  [sramDramArticle.pointId]: {
    article: sramDramArticle,
    directory: 'computer-organization',
    fileName: 'sram-dram.ts',
    exportName: 'sramDramArticle',
  },
  [multiModuleArticle.pointId]: {
    article: multiModuleArticle,
    directory: 'computer-organization',
    fileName: 'multi-module.ts',
    exportName: 'multiModuleArticle',
  },
  [memoryExpandArticle.pointId]: {
    article: memoryExpandArticle,
    directory: 'computer-organization',
    fileName: 'memory-expand.ts',
    exportName: 'memoryExpandArticle',
  },
  [coCacheBasicsArticle.pointId]: {
    article: coCacheBasicsArticle,
    directory: 'computer-organization',
    fileName: 'co-cache-basics.ts',
    exportName: 'coCacheBasicsArticle',
  },
  [coCacheReplaceWriteArticle.pointId]: {
    article: coCacheReplaceWriteArticle,
    directory: 'computer-organization',
    fileName: 'co-cache-replace-write.ts',
    exportName: 'coCacheReplaceWriteArticle',
  },
  [coCachePerformanceArticle.pointId]: {
    article: coCachePerformanceArticle,
    directory: 'computer-organization',
    fileName: 'co-cache-performance.ts',
    exportName: 'coCachePerformanceArticle',
  },
  [coVmBasicsArticle.pointId]: {
    article: coVmBasicsArticle,
    directory: 'computer-organization',
    fileName: 'co-vm-basics.ts',
    exportName: 'coVmBasicsArticle',
  },
  [coVmImplArticle.pointId]: {
    article: coVmImplArticle,
    directory: 'computer-organization',
    fileName: 'co-vm-impl.ts',
    exportName: 'coVmImplArticle',
  },
  [coExternalHddArticle.pointId]: {
    article: coExternalHddArticle,
    directory: 'computer-organization',
    fileName: 'co-external-hdd.ts',
    exportName: 'coExternalHddArticle',
  },
  [coExternalSsdArticle.pointId]: {
    article: coExternalSsdArticle,
    directory: 'computer-organization',
    fileName: 'co-external-ssd.ts',
    exportName: 'coExternalSsdArticle',
  },
  [instruction_formatArticle.pointId]: {
    article: instruction_formatArticle,
    directory: 'computer-organization',
    fileName: 'instruction-format.ts',
    exportName: 'instruction_formatArticle',
  },
  [addressingArticle.pointId]: {
    article: addressingArticle,
    directory: 'computer-organization',
    fileName: 'addressing.ts',
    exportName: 'addressingArticle',
  },
  [alignmentArticle.pointId]: {
    article: alignmentArticle,
    directory: 'computer-organization',
    fileName: 'alignment.ts',
    exportName: 'alignmentArticle',
  },
  [datapathArticle.pointId]: {
    article: datapathArticle,
    directory: 'computer-organization',
    fileName: 'datapath.ts',
    exportName: 'datapathArticle',
  },
  [executeArticle.pointId]: {
    article: executeArticle,
    directory: 'computer-organization',
    fileName: 'execute.ts',
    exportName: 'executeArticle',
  },
  [controllerArticle.pointId]: {
    article: controllerArticle,
    directory: 'computer-organization',
    fileName: 'controller.ts',
    exportName: 'controllerArticle',
  },
  [pipelineArticle.pointId]: {
    article: pipelineArticle,
    directory: 'computer-organization',
    fileName: 'pipeline.ts',
    exportName: 'pipelineArticle',
  },
  [multicoreArticle.pointId]: {
    article: multicoreArticle,
    directory: 'computer-organization',
    fileName: 'multicore.ts',
    exportName: 'multicoreArticle',
  },
  [busArticle.pointId]: {
    article: busArticle,
    directory: 'computer-organization',
    fileName: 'bus.ts',
    exportName: 'busArticle',
  },
  [io_methodArticle.pointId]: {
    article: io_methodArticle,
    directory: 'computer-organization',
    fileName: 'io-method.ts',
    exportName: 'io_methodArticle',
  },
  [interruptArticle.pointId]: {
    article: interruptArticle,
    directory: 'computer-organization',
    fileName: 'interrupt.ts',
    exportName: 'interruptArticle',
  },
  [featuresArticle.pointId]: {
    article: featuresArticle,
    directory: 'operating-systems',
    fileName: 'features.ts',
    exportName: 'featuresArticle',
  },
  [functionsArticle.pointId]: {
    article: functionsArticle,
    directory: 'operating-systems',
    fileName: 'functions.ts',
    exportName: 'functionsArticle',
  },
  [classificationArticle.pointId]: {
    article: classificationArticle,
    directory: 'operating-systems',
    fileName: 'classification.ts',
    exportName: 'classificationArticle',
  },
  [bootArticle.pointId]: {
    article: bootArticle,
    directory: 'operating-systems',
    fileName: 'boot.ts',
    exportName: 'bootArticle',
  },
  [virtualMachineArticle.pointId]: {
    article: virtualMachineArticle,
    directory: 'operating-systems',
    fileName: 'virtual-machine.ts',
    exportName: 'virtualMachineArticle',
  },
  [processArticle.pointId]: {
    article: processArticle,
    directory: 'operating-systems',
    fileName: 'process.ts',
    exportName: 'processArticle',
  },
  [threadArticle.pointId]: {
    article: threadArticle,
    directory: 'operating-systems',
    fileName: 'thread.ts',
    exportName: 'threadArticle',
  },
  [scheduleArticle.pointId]: {
    article: scheduleArticle,
    directory: 'operating-systems',
    fileName: 'schedule.ts',
    exportName: 'scheduleArticle',
  },
  [syncArticle.pointId]: {
    article: syncArticle,
    directory: 'operating-systems',
    fileName: 'sync.ts',
    exportName: 'syncArticle',
  },
  [deadlockArticle.pointId]: {
    article: deadlockArticle,
    directory: 'operating-systems',
    fileName: 'deadlock.ts',
    exportName: 'deadlockArticle',
  },
  [contiguousAllocationArticle.pointId]: {
    article: contiguousAllocationArticle,
    directory: 'operating-systems',
    fileName: 'contiguous-allocation.ts',
    exportName: 'contiguousAllocationArticle',
  },
  [noncontiguousAllocationArticle.pointId]: {
    article: noncontiguousAllocationArticle,
    directory: 'operating-systems',
    fileName: 'noncontiguous-allocation.ts',
    exportName: 'noncontiguousAllocationArticle',
  },
  [fileFcbArticle.pointId]: {
    article: fileFcbArticle,
    directory: 'operating-systems',
    fileName: 'file-fcb.ts',
    exportName: 'fileFcbArticle',
  },
  [fileOperationsArticle.pointId]: {
    article: fileOperationsArticle,
    directory: 'operating-systems',
    fileName: 'file-operations.ts',
    exportName: 'fileOperationsArticle',
  },
  [fileLogicalArticle.pointId]: {
    article: fileLogicalArticle,
    directory: 'operating-systems',
    fileName: 'file-logical.ts',
    exportName: 'fileLogicalArticle',
  },
  [filePhysicalArticle.pointId]: {
    article: filePhysicalArticle,
    directory: 'operating-systems',
    fileName: 'file-physical.ts',
    exportName: 'filePhysicalArticle',
  },
  [directoryConceptArticle.pointId]: {
    article: directoryConceptArticle,
    directory: 'operating-systems',
    fileName: 'directory-concept.ts',
    exportName: 'directoryConceptArticle',
  },
  [filesystemSpaceArticle.pointId]: {
    article: filesystemSpaceArticle,
    directory: 'operating-systems',
    fileName: 'filesystem-space.ts',
    exportName: 'filesystemSpaceArticle',
  },
  [filesystemVfsArticle.pointId]: {
    article: filesystemVfsArticle,
    directory: 'operating-systems',
    fileName: 'filesystem-vfs.ts',
    exportName: 'filesystemVfsArticle',
  },
  [bufferArticle.pointId]: {
    article: bufferArticle,
    directory: 'operating-systems',
    fileName: 'buffer.ts',
    exportName: 'bufferArticle',
  },
}

const registeredBlockIds = new Set<string>()
for (const { article } of Object.values(knowledgeArticleRegistry)) {
  for (const block of article.subpoints.flatMap((subpoint) => subpoint.blocks)) {
    if (registeredBlockIds.has(block.id)) throw new Error(`Knowledge Block ID 重复：${block.id}`)
    registeredBlockIds.add(block.id)
  }
}

export function getKnowledgeArticleRegistration(pointId: string) {
  return knowledgeArticleRegistry[pointId]
}

export type KnowledgeSubpointLocation = {
  pointId: string
  subpointId: string
  subpointTitle: string
}

/** 由知识块 ID（kb-*）反查它所属的小知识点 subpoint。 */
export function findSubpointLocationByBlockId(blockId: string): KnowledgeSubpointLocation | undefined {
  for (const [pointId, registration] of Object.entries(knowledgeArticleRegistry)) {
    const subpoint = registration.article.subpoints.find((candidate) =>
      candidate.blocks.some((block) => block.id === blockId),
    )
    if (subpoint) {
      return {
        pointId,
        subpointId: subpoint.id,
        subpointTitle: subpoint.title,
      }
    }
  }
  return undefined
}

/** 由知识块 ID（kb-*）反查它所属的知识点 pointId */
export function findPointIdByBlockId(blockId: string): string | undefined {
  return findSubpointLocationByBlockId(blockId)?.pointId
}

export function resolveKnowledgeArticle(point: KnowledgePoint): KnowledgeArticleData {
  const registration = getKnowledgeArticleRegistration(point.id)
  if (registration) return registration.article

  return {
    pointId: point.id,
    subpoints: [
      {
        id: `${point.id}-overview`,
        title: '核心概念',
        blocks: [{ id: `kb-${point.id}-overview-1`, type: 'paragraph', text: point.summary }],
      },
    ],
  }
}
