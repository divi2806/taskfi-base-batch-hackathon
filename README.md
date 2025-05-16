# TASK-fi

A DAO-based productivity platform that rewards users with $TASK tokens for completing productivity tasks and provides an AI agent marketplace.
WORKING URL MVP LINK - https://insight-quest-frontend.vercel.app/

### MAINNET TRANSACTION CONTRACT - 
[https://basescan.org/address/0x55811c42441e0e77364d531b8c4b987a8dc1308e]

## Table of Contents

- [Overview](#overview)
- [Research & Insights](#research-&-insights)
- [What Problem are we solving](#what-problem-we-are-solving)
- [Role Stakeholders flow aligning with lokachakra](#role-stakeholders-flow-mapping)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [Tokenomics](#tokenomics)
- [Revenue Model](#revenue-model)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

TaskFi is a decentralized productivity platform powered by Web3 and governed by a DAO. It rewards users with $TASK tokens for completing meaningful tasks like coding, learning, or mentoring. Users can create and complete personal or peer tasks, access a marketplace of AI agents/human agents,a platform where young entrepreneurs can get knowledge tools, right services and our own customized AI to get knowledge about latest events in the startup industry,grants,fundings, sources to scale from 0-->1 and even book live human sessions (yoga, mentoring, therapy). Every action is verified (via AI or community), ensuring fairness and transparency. TaskFi turns productivity, effort, and knowledge into real economic value — making it a platform where users not only grow, but earn and contribute to a community-led ecosystem.

## Research & Insights

- Duolingo's 2023 revenue: $525M — majority from users paying for "accountability tools"
- StepN’s model reached 3M users in <6 months, showing high traction for token-based fitness productivity
- A 2022 study (Harvard) found that **reward-based habit formation increases daily retention by over 48%**
- Users spend on average **2+ hours/day** on productive platforms — yet monetization is still one-sided


## What Problem We Are Solving

Millions of users spend hours every day doing valuable microtasks — like learning to code, improving mental health, consuming educational content, or completing personal goals. Yet:

- These efforts are **unrewarded or underpaid**
- Most platforms are **centralized**, with no user ownership or governance
- There's **no structured incentive loop** to keep users consistently engaged
- Users need both **technical and human support** to stay motivated — but there's no unified space for this

## Role stakeholders flow mapping 
User/Individual Learner (e.g., Student, Developer, Self-learner)
1.) Onboard using MetaMask
2.) Complete daily tasks (e.g., solve coding problems, complete Coursera lessons)
3.) Earn $TASK tokens based on verified proof of work
4.) Use $TASK for AI features like streak boosts or image verification
5.) Join challenges or tournaments
6.) Stake tokens for multipliers, contest access, and DAO rights

🧑‍🏫 Mentors / Educators / AI Agent Creators
1.) Deploy custom AI agents (e.g., code reviewer, daily planner)
2.) Earn $TASK when others use their agent (creator economy)
3.) Gain recognition and revenue through transparent usage tracking
4.) Propose new learning tools via DAO

👥 Community Members / Validators
1.) Validate task submissions manually or via AI
2.) Earn volunteer points, karma, and $TASK tokens
3.) Participate in governance
4.) Help onboard and moderate communities

🏢 Enterprises / CSR Organizations / Institutions
1.) Integrate TaskFi API into Slack, Discord, LMS, or productivity tools
2.) Pay in $TASK to run employee learning contests or incentive systems
3.) Sponsor branded challenges
4.) Track learning progress via tokenized logs

📊 Investors / Token Holders / DAO Participants
1.) Provide liquidity or stake $TASK
2.) Vote on proposals for ecosystem development
3.) Receive proportional revenue share from platform activities
4.) Shape governance, roadmap, and reward structures

⚖️ Regulatory / Legal / Audit
1.) Audit smart contracts and fund movements
2.) Ensure compliance through open-source documentation
3.) Can interact via DAO with proposal voting (as advisors)


### Core Concept

Think of TaskFi as "Duolingo + ChatGPT + Headspace + Upwork + Web3", combined with a token economy:
 -**Earn $TASK** by completing productive, verifiable tasks
 -**Use or create AI agents** to automate productivity workflows
 -**Get access to tools** and assistance as a young founder you need to scale from 0--->1
 -**For business** - Reward your employees and track their productivity transparently and gain insights of employees activities during the working hours
 -**Access or offer human-led sessions** (e.g., yoga, mentorship, therapy)
 -**Deploy your own AI/human agents** and earn per usage
-**Vote** on features, rules, and platform direction via DAO
 -**Compete** in gamified challenges and boost reputation
 -**Stake tokens** for exclusive access and returns

## Features

### Task-Based Rewards System
- Complete productivity tasks to earn $TASK tokens
- LeetCode problem solving
- Educational content consumption
- Daily login streaks
- STAKING $TASK tokens for 8-10% APY depending upon type of nodes

### Verification Layer
- AI-based verification of task completion
- Community verification system
- Proof submission and validation
- Using FRACTAL-id for unique user and KYC 

### AI/Human Agent Marketplace
- Purchase AI agents using $TASK tokens
- Deploy and monetize your own AI agents
- Revenue sharing: 97.5% to creators, 2.5% platform fee
- Can also provide services as a freelancer (for a startup that requires financial expertise,legalties [can list the services for $TASK tokens])


### Zappy Chat
- Personal AI assistant for planning and brainstorming
- Trained on our own data for startups and web3
- Customizable features with $TASK tokens

### Contests & Challenges
- Participate in productivity competitions
- Win token rewards and recognition

### Leaderboard & Gamification
- XP system and level progression
- Public leaderboard

## Technical Architecture

### Frontend
- React with Vite
- Tailwind CSS
- ShadCN UI components
- Context API for state management

### Backend
- Node.js with FastAPI
- Authentication via MetaMask
- Firebase Firestore & Storage
- Gemini AI integration

### Blockchain Integration
- ethers.js for Ethereum interaction (using BASE)
- Solidity smart contracts
- Base testnet (initial), Base Chain (Done)

## Getting Started

### Prerequisites
- Node.js 16+
- MetaMask wallet
- Bun package manager (recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/insight-quest-rewards.git
cd insight-quest-rewards
```

2. Install dependencies
```bash
bun install
```

3. Run the development server
```bash
bun run dev
```

4. Build for production
```bash
bun run build
```

## Tokenomics

### $TASK Token Overview
- **Token Type**: ERC-20
- **Total Supply**: 1,000,000,000 (1B)
- **Network**: Base Testnet (initial), Base Mainnet (later)
- **Unlock Duration**: 3 years

### Token Allocation

| Category | Percentage | Amount | Unlock Schedule |
|----------|------------|--------|-----------------|
| User Rewards (REWARD POOL) | 45% | 450M | Linear over 3 years |
| Ecosystem Growth | 20% | 200M | Vesting + DAO-controlled |
| Team & Founders (TREASURY) | 15% | 150M | 1-year cliff + 3-year vesting |
| Investors / Strategic | 10% | 100M | Strategic rounds only |
| Community | 5% | 50M | First 6-12 months |
| Treasury & DAO Ops | 5% | 50M | Controlled by DAO |

### Token Utility
1. **AI Feature Access**: Pay for premium AI tools
2. **Marketplace Transactions**: Buy AI agents
3. **Contest Entry**: Join premium challenges
4. **Customization**: Purchase avatars and UI enhancements
5. **Governance**: Voting rights on platform decisions
6. **Developer Rewards**: Earn from creating AI agents
7. **Staking**: Earn multipliers and exclusive access

### Token Sinks (Burns/Locks)
- Percentage of AI agent purchases burned
- Fees for AI validation features
- Staking for rewards multipliers
- DAO proposal fees

## Revenue Model

TASK-fi generates revenue through multiple transparent channels that benefit both the platform and the community:

### 1. AI Agent Marketplace Commission (2.5%)
- Platform takes a 2.5% commission on all AI agent transactions
- Transparent fee structure visible in smart contracts
- Annual Projection (Year 2): 500,000 $TASK (based on 20M $TASK marketplace volume)

### 2. Premium Feature Subscriptions
- Users pay for premium features:
  - AI verification tools: 10-50 $TASK/month
  - Advanced analytics: 30-100 $TASK/month
  - Priority verification: 5-20 $TASK/transaction
  - Custom UI themes: 50-200 $TASK one-time
- Annual Projection: 3M $TASK (5% of 100,000 users at avg 50 $TASK/month)

### 3. Enterprise API Integration Fees
- Implementation fee: 5,000-50,000 $TASK
- Annual license: 10,000-100,000 $TASK
- Per-transaction fee: 0.5-1% of rewards
- Annual Projection: 300,000 $TASK (10 clients at avg 30,000 $TASK each)

### 4. Contest Platform Fees
- Contest creation fee (10% to platform)
- Entry fees (5-10% retained)
- Brand sponsorship fees (5-15%)
- Annual Projection: 250,000 $TASK (500 contests, avg 5,000 $TASK turnover, 10% fee)

### 5. Token Transaction Fees
- 0.5-1% on non-reward token transactions
- Split: 40% burn, 30% treasury, 30% reward pool
- Annual Projection: 250,000 $TASK (50M transaction volume at 0.5%)

### 6. Staking Program Revenue
- 10% of staking rewards to treasury
- Annual Projection: 500,000 $TASK

### Treasury Management
Revenue allocation through the DAO:
- **Development Fund**: 40% - Platform improvements
- **Buyback Fund**: 30% - Token buybacks and burns
- **Reward Pool**: 20% - Additional user rewards
- **Contingency Reserve**: 10% - Emergency fund

### Revenue Growth Projection

| Year | Projected Users | Projected Revenue ($TASK) | Main Revenue Sources |
|------|-----------------|--------------------------|---------------------|
| 1    | 50,000          | 1M                       | Marketplace fees, Premium subscriptions |
| 2    | 200,000         | 5M                       | Marketplace, Enterprise API, Contests |
| 3    | 500,000         | 15M                      | Enterprise solutions, Platform fees, Staking |
| 4    | 1,000,000       | 30M                      | Full ecosystem integration, B2B solutions |
| 5    | 2,000,000       | 60M                      | Platform-as-a-Service, Cross-chain integration |


## Future Roadmap

### Phase 1: Decentralized Storage
- IPFS/Arweave integration for fully decentralized storage
- Smart contract data storage for critical information

### Phase 2: Enhanced Security & Compliance
- FractalID integration with Polygon for KYC verification
- Smart contracts for AI agent ownership and usage rights
- Security measures to prevent agent misuse

### Phase 3: Platform Monitoring & Analytics
- Web3-based analytics for outage and downtime detection
- Real-time platform performance monitoring
- Public dashboard for system metrics


### Phase 4: Business Model Enhancement
- Enterprise solutions for corporate clients
- API integration services for other platforms
- Developer SDK for the TASK-fi ecosystem


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
