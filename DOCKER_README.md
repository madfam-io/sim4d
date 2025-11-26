# Sim4D Docker Setup

Complete Docker-based development environment with all services orchestrated.

## 🚀 Quick Start

```bash
# Start all services
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Stop services
./scripts/docker-dev.sh down
```

## 📦 What's Included

### Application Services

- **Studio** (`localhost:5173`) - React CAD application with real OCCT geometry
- **Marketing** (`localhost:3000`) - Landing page
- **Collaboration** (`localhost:8080`) - WebSocket server for real-time multi-user editing

### Infrastructure Services

- **Redis** (`localhost:6379`) - Session storage and pub/sub
- **PostgreSQL** (`localhost:5432`) - Collaboration persistence

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (localhost:5173)                           │
│  ↓ HTTP/WebSocket                                   │
├─────────────────────────────────────────────────────┤
│  Studio Container (Vite + React)                    │
│  ├─ Hot reload enabled                              │
│  ├─ Real OCCT geometry (no mocks)                   │
│  └─ Connects to → Collaboration WS                  │
├─────────────────────────────────────────────────────┤
│  Collaboration Container (Node.js + WebSocket)      │
│  ├─ Real-time cursor tracking                       │
│  ├─ Node locking                                    │
│  └─ Connects to → Redis, PostgreSQL                 │
├─────────────────────────────────────────────────────┤
│  Redis Container (Session Storage)                  │
│  └─ AOF persistence enabled                         │
├─────────────────────────────────────────────────────┤
│  PostgreSQL Container (Collaboration DB)            │
│  └─ Initialized with schema                         │
└─────────────────────────────────────────────────────┘
```

## 📋 Files Created

- `docker-compose.yml` - Service orchestration
- `Dockerfile.studio` - Studio app container
- `Dockerfile.marketing` - Marketing site container
- `Dockerfile.collaboration` - Collaboration server container
- `.dockerignore` - Build optimization
- `scripts/docker-dev.sh` - Management script
- `scripts/init-db.sql` - PostgreSQL schema
- `docs/development/DOCKER_SETUP.md` - Complete documentation

## 🎯 Key Features

### Development Experience

✅ **Hot Reload** - All apps support live code updates
✅ **Volume Mounts** - Source code synced with containers
✅ **Fast Builds** - Multi-stage caching optimized
✅ **Health Checks** - Services monitored automatically

### Real OCCT Geometry

✅ **No Mock Fallback** - Real OCCT WASM only
✅ **Environment Variables** - `ENABLE_MOCK_GEOMETRY=false`
✅ **Browser WASM** - Full B-Rep/NURBS support

### Collaboration Features

✅ **WebSocket Server** - Real-time multi-user editing
✅ **PostgreSQL Persistence** - Session and operation history
✅ **Redis Pub/Sub** - Fast message distribution
✅ **Operational Transform** - Conflict resolution

## 🔧 Commands

### Service Management

```bash
./scripts/docker-dev.sh up          # Start all services
./scripts/docker-dev.sh down        # Stop all services
./scripts/docker-dev.sh restart     # Restart services
./scripts/docker-dev.sh ps          # Service status
```

### Logs and Debugging

```bash
./scripts/docker-dev.sh logs                # All logs
./scripts/docker-dev.sh logs studio         # Studio logs only
./scripts/docker-dev.sh shell studio        # Open shell in studio
```

### Build and Cleanup

```bash
./scripts/docker-dev.sh build       # Rebuild images
./scripts/docker-dev.sh clean       # Remove all data
./scripts/docker-dev.sh test        # Run tests in Docker
```

## 🌐 Access Points

| Service       | URL                   | Description               |
| ------------- | --------------------- | ------------------------- |
| Studio        | http://localhost:5173 | Main CAD application      |
| Marketing     | http://localhost:3000 | Landing page              |
| Collaboration | ws://localhost:8080   | WebSocket server          |
| PostgreSQL    | localhost:5432        | Database (user: sim4d) |
| Redis         | localhost:6379        | Cache and pub/sub         |

## 📊 Environment Variables

### Studio (`Dockerfile.studio`)

```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_COLLAB_WS_URL=ws://localhost:8080
ENABLE_MOCK_GEOMETRY=false
REQUIRE_REAL_OCCT=true
```

### Collaboration (`Dockerfile.collaboration`)

```env
COLLAB_PORT=8080
HEARTBEAT_INTERVAL=30000
LOCK_TIMEOUT=60000
```

### PostgreSQL

```env
POSTGRES_DB=sim4d
POSTGRES_USER=sim4d
POSTGRES_PASSWORD=sim4d_dev_password
```

## 🗄️ Database Schema

The PostgreSQL database includes:

- `collaboration_sessions` - Active collaboration sessions
- `session_users` - User participation tracking
- `graph_operations` - Operational transform history
- `node_locks` - Exclusive edit locks

See `scripts/init-db.sql` for complete schema.

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check Docker
docker info

# View logs
./scripts/docker-dev.sh logs

# Rebuild
./scripts/docker-dev.sh build
```

### Port Conflicts

Stop services using ports 5173, 3000, 8080, 5432, 6379 or modify `docker-compose.yml`.

### Database Issues

```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready -U sim4d

# Check Redis
docker-compose exec redis redis-cli ping
```

### Clean Slate

```bash
./scripts/docker-dev.sh clean
./scripts/docker-dev.sh build
./scripts/docker-dev.sh up
```

## 📈 Performance

### Memory Requirements

- Studio: 512MB-1GB
- Marketing: 256MB-512MB
- Collaboration: 128MB-256MB
- Redis: 50MB-100MB
- PostgreSQL: 100MB-200MB

**Total: ~1.5-2.5GB**

### Build Time

- Initial build: ~5-10 minutes
- Incremental: ~30-60 seconds

## 📚 Documentation

For complete details, see:

- [Docker Setup Guide](docs/development/DOCKER_SETUP.md) - Full documentation
- [Native Setup](docs/development/SETUP.md) - Non-Docker development
- [Architecture](docs/technical/ARCHITECTURE.md) - System design

## ✅ Benefits vs Native Development

| Feature       | Native (pnpm) | Docker       |
| ------------- | ------------- | ------------ |
| Hot Reload    | ✅ Fast       | ✅ Good      |
| Isolated Env  | ❌ No         | ✅ Yes       |
| Service Deps  | ❌ Manual     | ✅ Automated |
| Reproducible  | ⚠️ Maybe      | ✅ Always    |
| Collaboration | ❌ Manual     | ✅ Included  |
| Database      | ❌ Manual     | ✅ Automated |

## 🎉 Success Criteria

When `./scripts/docker-dev.sh up` completes successfully:

✅ Studio accessible at http://localhost:5173
✅ Marketing accessible at http://localhost:3000
✅ Collaboration WebSocket at ws://localhost:8080
✅ PostgreSQL ready on localhost:5432
✅ Redis ready on localhost:6379
✅ All health checks passing

## 🤝 Contributing

When adding new services:

1. Add service to `docker-compose.yml`
2. Create Dockerfile if needed
3. Update `scripts/docker-dev.sh` if necessary
4. Document in `docs/development/DOCKER_SETUP.md`

---

**Next Steps:**

1. Run `./scripts/docker-dev.sh up` to start all services
2. Open http://localhost:5173 in your browser
3. Check logs with `./scripts/docker-dev.sh logs` if issues occur
