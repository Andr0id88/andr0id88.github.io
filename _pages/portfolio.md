---
title: "André Hansen | CV and portfolio"
layout: single
permalink: /portfolio/
author_profile: false
excerpt: "Senior System Engineer specialising in Linux infrastructure, Kubernetes, platform operations, and practical automation."
---

# André Hansen

## Senior System Engineer

I operate Linux infrastructure and Kubernetes platforms supporting national healthcare services in Norway. My work combines hands-on operations, troubleshooting, incident response, and automation.

I also build practical tools that make platforms easier to understand and operate. Much of my recent development work is in **Go**. I also work with Bash and am familiar with Python.

[Download CV](/preview/andre-hansen-cv.pdf) · [View projects](#selected-projects) · [Contact me](#contact) · [Email](mailto:1988.hansen@gmail.com) · [GitHub](https://github.com/andr0id88) · [LinkedIn](https://www.linkedin.com/in/andr%C3%A9-hansen-77914a1a1/)

## Selected achievements

Highlights from previous work. Figures describe the environments and projects at the time.

- **Kubernetes platform migration (Tanzu to Vitistack):** Contributed to building Vitistack and the transition from Tanzu for platforms supporting national healthcare services. My work spans Kubernetes, Talos, platform upgrades, and operational automation.
- **1,400+ Linux servers:** Worked with a Linux estate of more than 1,400 servers, including third-line troubleshooting and on-call responsibilities.
- **Approximately 1,400 servers migrated:** Contributed to the migration of approximately 1,400 servers to a new Red Hat Satellite environment.

## Selected projects

### Tanzu to Vitistack

**Kubernetes migration · Team contribution**

As part of the Kubernetes team, I have contributed to building Vitistack and migrating from Tanzu. This work brings together platform operations, Kubernetes upgrades, Talos, and automation in an environment supporting national healthcare services.

Alongside the migration, I develop Viti Center to make platform state, migration progress, and resilience risks visible to the operations team.

### Viti Center

**Internal platform operations project · Norsk helsenett SF**

From cluster requests to day-to-day platform operations.

**What I build:** I develop Viti Center, a Go-based platform that connects infrastructure diagnostics with the workflows needed to operate Vitistack. It brings requests, provisioning, cluster lifecycle, access, and platform health into one workspace, alongside my contribution to the Tanzu-to-Vitistack migration.

**Integrations and capabilities**

- **Requests and provisioning:** Connects Slack/vitibot requests to cluster creation, changes, deletion, access, and ROR project workflows. Tracks provisioning stages and supports completion notifications to requesters.
- **Cluster lifecycle:** Combines Kubernetes and Talos inventory with upgrade readiness, version checks, and reviewed workflows for provisioning, scaling, and decommissioning clusters.
- **Tooling and access:** Integrates Argo CD application health and drift with ROR inventory, project metadata, and access management. Provides controlled tooling actions and records administrative activity.
- **Infrastructure and resilience:** Brings together KubeVirt placement and capacity, Ceph storage health, operator diagnostics, and networking information. Highlights workloads exposed to a single worker-node failure and makes placement and anti-affinity risks actionable.

**Engineering scope:** A Go hub and distributed agents collect information across sites and clusters. Operational workflows include permission checks, plan review, and audit records. Missing or stale reports remain visible, so incomplete information is not mistaken for a healthy platform.

**Practical value:** An operator can follow a request from its Slack entry into provisioning, investigate the resulting cluster and its tooling, and review migration progress or resilience findings in the same workspace. The project connects the operational context that would otherwise need to be assembled across separate systems.

Integration capabilities depend on configuration and access permissions. This is an internal project, not a public source-code release.

[View the platform overview with demonstration data](/preview/media/viti-center-overview.png). The overview brings together platform health, running operations, findings, pending orders, tooling state, upgrade readiness, releases, and migration tracking. Platform releases include version currency and differences between datacenters. Names and figures are illustrative. [View the cluster list and details pane](/preview/media/viti-center-clusters.png). Expanded location filters show the fleet across three demonstration datacenters from one central hub. Inspect a cluster’s platform versions, machine capacity, network information, and readiness in the same workspace. This view also uses mock data.

### Automation & tooling

I automate recurring Linux and Kubernetes operations, from rebuilding infrastructure to upgrading platforms and rotating SSH keys.

- **Red Hat Satellite lifecycle:** Automated Satellite installation, configuration and rebuilds with Ansible and Hammer, making deployments repeatable and simplifying maintenance. This complemented my contribution to migrating approximately 1,400 servers to a new Satellite environment.
- **Kubernetes upgrade tooling:** Built tooling for recurring Kubernetes upgrade tasks in Tanzu and Talos environments, helping standardise platform maintenance and reduce manual work.
- **CyberArk SSH-key rotation:** Automated SSH-key rotation through the CyberArk API, reducing manual credential handling across Linux infrastructure.
- **Satellite & Insights incident response:** Built tools using the Satellite and Insights APIs to bring Linux fleet information into investigation, troubleshooting and incident-response workflows.
- **Red Hat and CentOS labs:** Ansible and AWX automation for provisioning and configuring Linux lab environments.
- **Licence counting:** Built a Python tool to automate licence counting and reduce manual work.

### Hivemind

**AI-assisted development · Personal project · Repository currently private**

I could not find a Linux AI tool that fit the way I work, so I built Hivemind from scratch around my own workflow. It brings coding-agent sessions, activity, and usage visibility into a desktop and terminal workspace, with support for review and second opinions.

The aim is to make work across multiple agents easier to follow: keep track of ongoing tasks, move between sessions, and see where attention is needed. It reflects the same approach I bring to infrastructure: understand the workflow, reduce repetitive steps, and build tools that make the work easier to manage.


## Work experience

### Senior System Engineer, Norsk helsenett SF

**Tromsø, Norway · April 2020–present**

**Kubernetes team · April 2025–present**

- **Tanzu operations:** worked with around **300 Tanzu clusters and 1,400 Tanzu nodes**.
- **Current combined platform:** around **500 clusters in total**, comprising approximately **300 Tanzu and 200 Vitistack clusters**, supporting critical healthcare infrastructure.
- Contribute to Kubernetes upgrades, platform automation, and the transition from Tanzu to Viti/Vitistack, including work with Talos.
- Develop internal operational tools, including Viti Center. Much of my recent coding work is in Go.

**Linux operations and automation**

- Linux operations and third-line troubleshooting, with Ansible and Hammer automation for Satellite installation, configuration, and rebuilds.
- On-call responsibilities across Linux, container, and HashiCorp Vault teams, including incident response.
- CyberArk API automation for SSH-key rotation, and incident-response tooling using Satellite and Insights APIs.

### System Administrator, Nordland fylkeskommune

**July 2018–April 2020**

## Technical skills

### Linux and lifecycle management

**RHEL · Red Hat Satellite · Hammer · Insights**

Linux operations, lifecycle management, patching, and third-line troubleshooting in large server environments.

### Containers and platforms

**Kubernetes · Talos · Tanzu · Vitistack · Harbor**

Platform operations, Kubernetes upgrades, and migration work, with recent focus on the transition from Tanzu to Vitistack and work involving Talos.

### Automation and development

**Go · Python · Bash · Ansible/AWX · Puppet**

Much of my recent tool development is in Go. I am familiar with Python and have practical experience in Bash scripting and infrastructure automation using Ansible, AWX and Puppet.

### Security and operations

**HashiCorp Vault · CyberArk · Monitoring · Incident response**

On-call work, operational troubleshooting, platform visibility, and automation involving SSH-key rotation.

### How I work

Linux is both my professional focus and a long-standing personal interest. I enjoy understanding how systems behave, troubleshooting difficult problems, and improving the tools I use every day.

When a task becomes repetitive, I look for a way to make it repeatable and easier to operate. That mindset runs through my scripting, platform automation, Viti Center, and my AI-assisted development workflow with Hivemind.

## Certifications and education

### Certifications earned

- **RHCE (Red Hat Certified Engineer):** earned April 2024.
- **RHCSA (Red Hat Certified System Administrator):** earned February 2024.

### Training completed

- **CKA course:** completed in 2023.
- **Puppet Advanced:** completed in 2022.
- **Puppet Essentials:** completed in 2021.

### Education: Oscarsborg VGS

- Computer and electronics VG3 (2017).
- Computer and electronics VG2 (2016).
- Electronics VG1 (2015).

<!-- Editorial follow-up, not public CV copy:
Automation case-study detail pending: exact steps automated by the Tanzu/Talos upgrade tools; exact Satellite/Insights API actions during incident response. The owner has confirmed personally developing the four automation examples. Do not infer scanning, patching, isolation, ticket creation, or automatic remediation.
Lab context pending: location, period, role, and exact provisioning/configuration scope. Student/teaching claims are withheld until confirmed.
Education entries are transcribed from the original website CV. Confirm the formal qualification before naming a degree or trade certificate.
Missing: Oscarsborg VGS IT/teaching job title, dates, and responsibilities; Norwegian and English proficiency levels.
Viti Center integration capabilities are grounded in the local project README and implementation structure, not roadmap documents. Public copy does not assert that every optional feature is enabled in production. Automatic field completion, separate Slack bot ownership, feature adoption, and measured workflow improvements still need confirmation.
Confirm individual initiation/design/build/maintenance responsibilities for Viti Center, Hivemind, and the Slack/provisioning workflow, and the actual contribution in AI-assisted development.
Add quantitative or colleague-adoption outcomes only when supported by evidence.
The 1,400-node figure applies to the earlier Tanzu environment of about 300 clusters; exact period remains to be confirmed. It is separate from the Linux server estate and the current combined count of about 500 clusters.
Certification dates are dates earned; current validity has not been verified.
The LinkedIn URL is retained from _config.yml with a valid HTTPS scheme; confirm it is the correct current profile.
Portfolio media was captured from isolated local interfaces using mock data and generic identifiers. No production infrastructure data or employer-owned source code is included.
-->

## Contact

- [Email: 1988.hansen@gmail.com](mailto:1988.hansen@gmail.com)
- [GitHub: andr0id88](https://github.com/andr0id88)
- [LinkedIn](https://www.linkedin.com/in/andr%C3%A9-hansen-77914a1a1/)
- [Download CV](/preview/andre-hansen-cv.pdf)
