# Contexto Lab - Palo Alto Networks Prisma Access
## PAN-ILT-21 5.0 Version A (Onfulfillment Reader - desde pág. 480)

---

## Credenciales

| Recurso | Usuario | Contraseña |
|---------|---------|------------|
| Firewall A y B | `admin` | `Pal0Alt0!` |
| SCM (Strata Cloud Manager) | Ver README.txt en desktop Client-A | - |
| Pre-Shared Key VPN | - | `PrismaAccess319` |
| Local User GP | `testuser` | `Pal0Alt0!` |

---

## Entorno de Lab

- **Client-A** → accede a Firewall A (`172.16.17.254`) + Strata Cloud Manager
- **Client-B** → accede a Firewall B (`192.168.1.254`)
- **Client-MU** → simula usuario móvil (GlobalProtect/Proxy)
- **Firewall A** IP WAN: `172.16.17.1/24` (`ethernet1/2`) | IP interna misma interfaz
- **Firewall B** IP WAN: `203.0.113.25/24` (`ethernet1/1`) | IP interna: `192.168.1.1/24` (`ethernet1/2`)
- **Web server Site A**: `http://172.16.17.21`
- **Web server Site B**: `http://192.168.1.21`

---

## Service Endpoint Addresses (únicos por tenant)

| Tipo | FQDN | IP |
|------|------|----|
| Service Connection (Site A) | `site-a-service-connection.us-central.sc.jssosgony.lab.gpcloudservice.com` | `137.83.228.174` |
| Remote Network (Site B) | `us-central-pansy.rn.jssosgony.lab.gpcloudservice.com` | `34.99.88.254` |
| GlobalProtect Portal | `raymond-gp.lab.gpcloudservice.com` | — |

---

## Estado de Labs

| # | Lab | Estado |
|---|-----|--------|
| 5.1 | Service Infrastructure Subnet | ✅ Completado |
| 5.2 | Service Connections (Site A - Firewall A) | ✅ Túnel activo (verde) |
| 6 | Remote Networks (Site B - Firewall B) | ✅ Túnel activo (verde) |
| 7 | Mobile Users — GlobalProtect | ✅ Completado — GP conectado |
| 8 | Explicit Proxy | ⏳ Pendiente |
| 9 | ZTNA Connector | ⏳ Pendiente |
| 11 | ADEM | ⏳ Pendiente |

---

## ✅ Lab 5.1 — Service Infrastructure Subnet

SCM → Configuration Scope: Prisma Access → Prisma Access Infrastructure:
- Infrastructure Subnet: `192.168.255.0/24`
- Infrastructure BGP AS: `65534`
- Tunnel Monitor / Captive Portal / DNS IP: `192.168.255.254`

---

## ✅ Lab 5.2 — Service Connections (Site A)

### SCM

**Advanced Settings:**
- BGP Routing Preference: `Default`
- Withdraw Static Routes if tunnel down: ✅
- Backbone Routing: `Allow asymmetric routing and load sharing`

**Service Connection:**
- Name: `site-a-service-connection`
- Location: `US Central PA-G`
- Site: `site-a`

**IPSec Tunnel SCM (`site-a-service-connection-tunnel`):**
- Branch Device Type: `Other Devices` ← CRÍTICO, no cambiar
- Branch Device IP: `Dynamic`
- Auth: `Pre-Shared Key` → `PrismaAccess319`
- IKE Peer Identification: `User FQDN` → `site-a@prisma-access.lab`
- IKE Passive Mode: ✅
- IKEv2 Protocol: `IKEv2 only mode`
- IKEv2 Crypto Profile: `pa-lab-ike-crypto-profile`
- IPSec Crypto Profile: `pa-lab-ipsec-crypto-profile`

**Routing:** Static Route `172.16.17.0/24`

### Firewall A

**IKE Crypto Profile** (`pa-lab-ike-crypto-profile`):
- DH Group: `group20` | Authentication: `non-auth` | Encryption: `aes-256-gcm` | Lifetime: `1 hour`

**IPSec Crypto Profile** (`pa-lab-ipsec-crypto-profile`):
- Protocol: `ESP` | Encryption: `aes-256-gcm` | Auth: `sha256` | DH Group: `group20` | Lifetime: `1 hour`

**IKE Gateway** (`pa-lab-service-connection-ike-gateway`):
- Version: `IKEv2 only mode` | Interface: `ethernet1/2` | Local IP: `172.16.17.1/24`
- Peer IP Type: `FQDN` → `site-a-service-connection.us-central.sc.jssosgony.lab.gpcloudservice.com`
- PSK: `PrismaAccess319` | Local ID: `User FQDN` → `site-a@prisma-access.lab`
- NAT Traversal: ✅ | IKE Crypto Profile: `pa-lab-ike-crypto-profile`

**Zona:** `prisma-access` (Layer3)

**Tunnel Interface** `tunnel.11`:
- IP: `10.16.100.254/32` | VR: `lab-vr` | Zone: `prisma-access` | Mgmt Profile: `Ping`

**IPSec Tunnel** (`pa-lab-service-connection-ipsec-tunnel`):
- Tunnel: `tunnel.11` | IKE GW: `pa-lab-service-connection-ike-gateway`
- IPSec Profile: `pa-lab-ipsec-crypto-profile`
- Tunnel Monitor: ✅ → `192.168.255.254`, Profile: `default`

**Static Routes en lab-vr:**
- `prisma-access-infrastructure` → `192.168.255.0/24` via `tunnel.11`
- `site-b` → `192.168.1.0/24` via `tunnel.11`
- `mu-subnet` → `100.92.0.0/16` via `tunnel.11`

**Security Policy:** `allow-prisma-access` (Source/Dest: Internal + prisma-access → Allow)

---

## ✅ Lab 6 — Remote Networks (Site B)

### SCM

**Remote Network:**
- Name: `site-b-remote-network`
- Location: `US Central PA-G`
- Bandwidth: `50 Mbps`
- Service Endpoint: `us-central-pansy.rn.jssosgony.lab.gpcloudservice.com`

**IPSec Tunnel SCM (`site-b-remote-network-tunnel`):**
- Branch Device Type: `Other Devices`
- Branch Device IP: `Dynamic`
- PSK: `PrismaAccess319`
- IKE Peer ID: `User FQDN` → `site-b@prisma-access.lab`
- IKEv2 only | Crypto: `pa-lab-ike-crypto-profile` / `pa-lab-ipsec-crypto-profile`

**Routing:** Static Route `192.168.1.0/24`

**Address Objects (scope Remote Networks):**
- `site-a-subnet` → `172.16.17.0/24`
- `site-b-subnet` → `192.168.1.0/24`

**Security Rules (scope Remote Networks):**
- `rn-allow-site-a`: trust → trust (site-a-subnet ↔ site-b-subnet) → Allow
- `rn-allow-internet`: trust → untrust (any) → Allow

### Firewall B

**IKE Gateway** (`pa-lab-remote-network-ike-gateway`):
- Interface: `ethernet1/1` | Local IP: `203.0.113.25/24` ← CRÍTICO (no usar ethernet1/2)
- Peer: `us-central-pansy.rn.jssosgony.lab.gpcloudservice.com`
- PSK: `PrismaAccess319` | Local ID: `User FQDN` → `site-b@prisma-access.lab`
- IKE Profile: `pa-lab-ike-crypto-profile` | NAT Traversal: ✅

**Tunnel Interface** `tunnel.12`:
- VR: `lab-vr` | Zone: `prisma-access` | Mgmt Profile: `Ping`

**IPSec Tunnel** (`pa-lab-remote-network-ipsec-tunnel`):
- Tunnel: `tunnel.12` | IPSec Profile: `pa-lab-ipsec-crypto-profile`
- Tunnel Monitor: ✅ → `192.168.255.254`

**Static Routes en lab-vr:**
- `prisma-access-infrastructure` → `192.168.255.0/24` via `tunnel.12`
- `site-a` → `172.16.17.0/24` via `tunnel.12`
- `mu-subnet` → `100.92.0.0/16` via `tunnel.12`

**Security Policy:** `Allow-Prisma-Access` (Internal + prisma-access ↔ → Allow)

---

## ✅ Lab 7 — Mobile Users (GlobalProtect)

### SCM — Configuration Scope: GlobalProtect

**Portal Hostname:** `raymond-gp` → URL: `raymond-gp.lab.gpcloudservice.com`

**Client DNS (Worldwide):**
- Internal domain: `edulabs.local`
- Resolve internal domains only: ❌ (no marcado)

**Prisma Access Locations:**
- `US Central` ✅
- `Germany Central` ✅

**App Settings — "Tunnel":**
- Enable Autonomous DEM: ✅
- DEM for Prisma Access: `Install and User cannot Enable or Disable DEM`
- DEM for GP Version 6.3+: `Install the Agent`
- Mover a posición **Top** en la lista

**Security Policy (scope: Mobile Users Container):**
- `allow-internal-applications`: trust → trust → Allow
- `allow-mu-internet`: trust → untrust → Allow

**Local User (scope: Prisma Access → Identity Services → Local Users):**
- Username: `testuser` | Password: `Pal0Alt0!` | Enabled: ✅

**Push Config:** Scope GlobalProtect
- Gateways (US Central, Germany Central): ✅ Success
- Portal Ireland: Failure (transiente, no afectó el lab)
- Portal US East: Success

### Resultado verificado:
- Client-MU conectado via GP → **US Central — Best Available Gateway** ✅
- Acceso a `http://172.16.17.21` (Site A) ✅
- Acceso a `http://192.168.1.21` (Site B) ✅
- IP asignada: rango `100.92.0.0/16`

---

## ⏳ Siguiente: Lab 8 — Explicit Proxy

El Explicit Proxy permite a Mobile Users navegar tráfico web sin túnel full GP, usando un proxy HTTP/HTTPS explícito de Prisma Access.

**Punto de inicio:** SCM → Configuration Scope: Mobile Users → Explicit Proxy

---

## Lecciones aprendidas (errores resueltos)

| Error | Causa | Fix |
|-------|-------|-----|
| NO_PROPOSAL_CHOSEN en Site A | IKE Crypto Profile en `default` en Firewall A | Cambiar a `pa-lab-ike-crypto-profile` en Advanced Options |
| SCM Out of Sync | Múltiples cambios rápidos al Branch Device Type | Push Config → All Admins |
| Tunnel retransmission exceeded en Site B | Firewall B usaba `ethernet1/2` (192.168.1.1, IP privada) — el lab gateway no hace NAT para privadas | Cambiar IKE GW a `ethernet1/1` / `203.0.113.25/24` |
| Branch Device Type NGFW causa fallo | SCM ignora crypto profiles si está en "Palo Alto NGFW" | Debe ser **Other Devices** siempre |
| Save button disabled en security rule | Application field sin selección | Hacer click en "Any" |

---

## Comandos útiles CLI (PuTTY)

```bash
# Verificar túnel Service Connection (Firewall A)
test vpn ipsec-sa tunnel pa-lab-service-connection-ipsec-tunnel
show vpn ike-sa gateway pa-lab-service-connection-ike-gateway
ping source 10.16.100.254 host 192.168.255.254

# Verificar túnel Remote Network (Firewall B)
test vpn ipsec-sa tunnel pa-lab-remote-network-ipsec-tunnel
show vpn ike-sa gateway pa-lab-remote-network-ike-gateway

# Diagnóstico general
show routing route
ping source 203.0.113.25 host 34.99.88.254
```

---

## Notas importantes

- El entorno se **resetea cada semana** — algunos objetos pueden ya existir, usar "Manage" en vez de "Create New"
- Provisioning de Service/Remote Network puede tardar **hasta 1 hora** tras push
- `Branch Device Type` en SCM **SIEMPRE `Other Devices`** con crypto profiles personalizados
- PAN-OS + AES-GCM requiere `Authentication: non-auth` en el IKE Crypto Profile
- El lab usa `IKEv2 only mode` en SCM y en el firewall
- Firewall B debe usar `ethernet1/1` (203.0.113.25) para los túneles — el gateway no NATea IPs privadas
