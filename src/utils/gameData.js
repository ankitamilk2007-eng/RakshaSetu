// Game Data & District Definitions for NEXUS: 60 Minutes to Launch

export const DISTRICTS = {
  NETWORK: {
    id: 'NETWORK',
    name: 'Network District',
    concept: 'Computer Networking & Graph Topology',
    description: 'Reroute optical packet streams and resolve firewall congestion to restore city-wide comms.',
    color: '#00f3ff',
    beaconColor: '#00f3ff',
    position: [-45, 0, -35], // 3D coordinates in city
    buildingSize: [18, 55, 18],
    icon: 'Network',
    objective: 'Re-align packet routing nodes & eliminate 0% packet loss.',
    status: 'CRITICAL_FAILURE'
  },
  DATA_VAULT: {
    id: 'DATA_VAULT',
    name: 'Data Vault',
    concept: 'Database Systems & Relational Schema',
    description: 'Reconstruct broken primary-foreign key relationships and optimize query indexing.',
    color: '#ffaa00',
    beaconColor: '#ffaa00',
    position: [45, 0, -40],
    buildingSize: [22, 45, 22],
    icon: 'Database',
    objective: 'Link relational tables & clear database locks.',
    status: 'CORRUPTED'
  },
  CORE_REACTOR: {
    id: 'CORE_REACTOR',
    name: 'Core Reactor',
    concept: 'Operating Systems & CPU Task Scheduling',
    description: 'Allocate CPU cores to process threads, prevent deadlocks, and control core heat.',
    color: '#ff007f',
    beaconColor: '#ff007f',
    position: [-40, 0, 45],
    buildingSize: [20, 60, 20],
    icon: 'Cpu',
    objective: 'Balance CPU thread queues & prevent thermal meltdown.',
    status: 'OVERHEATING'
  },
  BUSINESS_TOWER: {
    id: 'BUSINESS_TOWER',
    name: 'Business Tower',
    concept: 'Business Systems, Cost, SLA & Risk Management',
    description: 'Balance R&D capital, security compliance, server throughput, and customer SLA targets.',
    color: '#00ff88',
    beaconColor: '#00ff88',
    position: [40, 0, 40],
    buildingSize: [24, 70, 24],
    icon: 'Briefcase',
    objective: 'Optimize capital allocation & maximize Launch SLA stability.',
    status: 'UNSTABLE'
  }
};

export const STORY_INTRO_DIALOGUES = [
  {
    title: "ALERT: 60 MINUTES TO GLOBAL LAUNCH",
    speaker: "NEXUS CENTRAL AI",
    text: "Operator, welcome to NEXUS City. In 60 minutes, NEXUS 2.0 goes live worldwide. However, critical city-wide infrastructure is failing!"
  },
  {
    title: "DISTRICT STATUS REPORT",
    speaker: "FIELD COMMAND",
    text: "Packet routing in the Network District is offline. The Data Vault schema is corrupted. Core Reactor CPU queues are deadlocked, and Business SLAs are failing."
  },
  {
    title: "YOUR MISSION",
    speaker: "FIELD COMMAND",
    text: "Physically navigate the city, enter all 4 key district facilities, interact with real system mechanics, and stabilize NEXUS before the countdown reaches zero!"
  }
];
