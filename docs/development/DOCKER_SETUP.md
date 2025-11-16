# Docker Development Setup

Complete Docker-based local development environment for BrepFlow with all services.

## Quick Start

```bash
# Start all services
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Stop all services
./scripts/docker-dev.sh down
```

## Architecture

The Docker setup includes:

### Application Services

- **studio** - React CAD application (port 5173)
- **marketing** - Marketing website (port 3000)
- **collaboration** - WebSocket server (port 8080)

### Infrastructure Services

- **redis** - Session storage and pub/sub (port 6379)
- **postgres** - Collaboration persistence (port 5432)

## Services

### Studio (Port 5173)

Main React application with node editor and 3D viewport.

**Environment Variables:**

- `NODE_ENV=development`
- `VITE_API_BASE_URL=http://localhost:3001`
- `VITE_COLLAB_WS_URL=ws://localhost:8080`
- `ENABLE_MOCK_GEOMETRY=false`
- `REQUIRE_REAL_OCCT=true`

**Volume Mounts:**

- Hot reload enabled for `apps/studio` and `packages`
- node_modules excluded for performance

### Marketing (Port 3000)

Landing page and marketing site.

**Volume Mounts:**

- Hot reload enabled for `apps/marketing`

### Collaboration (Port 8080)

WebSocket server for real-time multi-user editing.

**Environment Variables:**

- `COLLAB_PORT=8080`
- `HEARTBEAT_INTERVAL=30000`
- `LOCK_TIMEOUT=60000`

**Features:**

- Real-time cursor tracking
- Node locking for exclusive editing
- Operational transform for conflict resolution
- Session persistence via PostgreSQL

### Redis (Port 6379)

Session storage and pub/sub for collaboration features.

**Data Persistence:**

- Volume: `redis_data`
- AOF (Append-Only File) enabled

### PostgreSQL (Port 5432)

Database for collaboration sessions and operation history.

**Credentials:**

- Database: `brepflow`
- User: `brepflow`
- Password: `brepflow_dev_password`

**Schema:**

- `collaboration_sessions` - Active sessions
- `session_users` - User participation
- `graph_operations` - Operational transform history
- `node_locks` - Exclusive edit locks

## Commands

### Start Services

```bash
# All services
./scripts/docker-dev.sh up

# Specific services
./scripts/docker-dev.sh up studio
./scripts/docker-dev.sh up collaboration
```

### Stop Services

```bash
# All services
./scripts/docker-dev.sh down

# Clean up volumes and cached data
./scripts/docker-dev.sh clean
```

### View Logs

```bash
# All services
./scripts/docker-dev.sh logs

# Specific service
./scripts/docker-dev.sh logs studio
./scripts/docker-dev.sh logs collaboration
```

### Restart Services

```bash
# All services
./scripts/docker-dev.sh restart

# Specific service
./scripts/docker-dev.sh restart studio
```

### Build Images

```bash
# Build all images
./scripts/docker-dev.sh build

# Build specific service
./scripts/docker-dev.sh build studio
```

### Run Tests

```bash
# Run tests in Docker
./scripts/docker-dev.sh test
```

### Shell Access

```bash
# Open shell in studio container
./scripts/docker-dev.sh shell studio

# Open shell in collaboration container
./scripts/docker-dev.sh shell collaboration
```

## Development Workflow

### 1. Initial Setup

```bash
# Start all services
./scripts/docker-dev.sh up

# Wait for services to be ready (check logs)
./scripts/docker-dev.sh logs
```

### 2. Development

- Studio: http://localhost:5173
- Marketing: http://localhost:3000
- Changes auto-reload via volume mounts

### 3. Debugging

```bash
# View real-time logs
./scripts/docker-dev.sh logs studio

# Access container shell
./scripts/docker-dev.sh shell studio

# Check service status
./scripts/docker-dev.sh ps
```

### 4. Testing

```bash
# Run unit tests
./scripts/docker-dev.sh test

# Run E2E tests (requires services running)
pnpm run test:e2e
```

## Network

All services are connected via the `brepflow` bridge network:

- Services can communicate using service names
- Studio → `http://collaboration:8080`
- Collaboration → `redis:6379`, `postgres:5432`

## Volumes

### Persistent Data

- `redis_data` - Redis AOF persistence
- `postgres_data` - PostgreSQL database files

### Development Mounts

- Source code mounted with hot reload
- `node_modules` excluded for performance
- Build outputs regenerated in container

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# View service logs
./scripts/docker-dev.sh logs

# Rebuild images
./scripts/docker-dev.sh build
./scripts/docker-dev.sh up
```

### Port Conflicts

If ports are already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Database Connection Issues

```bash
# Check PostgreSQL health
docker-compose exec postgres pg_isready -U brepflow

# Check Redis
docker-compose exec redis redis-cli ping
```

### Hot Reload Not Working

```bash
# Restart the specific service
./scripts/docker-dev.sh restart studio

# Or rebuild
./scripts/docker-dev.sh build studio
./scripts/docker-dev.sh up studio
```

### Clean Slate

```bash
# Remove everything and start fresh
./scripts/docker-dev.sh clean
./scripts/docker-dev.sh build
./scripts/docker-dev.sh up
```

## Performance

### Build Performance

- Multi-stage builds minimize image size
- Workspace dependencies cached in layers
- pnpm with frozen lockfile for speed

### Runtime Performance

- Volume mounts for hot reload
- node_modules excluded from mounts
- Build outputs generated in container

### Memory Usage

Approximate memory requirements:

- Studio: 512MB-1GB
- Marketing: 256MB-512MB
- Collaboration: 128MB-256MB
- Redis: 50MB-100MB
- PostgreSQL: 100MB-200MB

**Total: ~1.5-2.5GB**

## Production Build

For production builds:

```bash
# Use Dockerfile.ci for complete build
docker build -f Dockerfile.ci -t brepflow:latest .

# Or build production images
docker-compose -f docker-compose.prod.yml build
```

## Environment Variables

Create `.env.docker` for custom configuration:

```env
# Studio
VITE_API_BASE_URL=http://localhost:3001
VITE_COLLAB_WS_URL=ws://localhost:8080

# Collaboration
COLLAB_PORT=8080
HEARTBEAT_INTERVAL=30000

# Database
POSTGRES_PASSWORD=your_secure_password
```

Then load with:

```bash
docker-compose --env-file .env.docker up
```

## See Also

- [Setup Guide](./SETUP.md) - Native development setup
- [Architecture](../technical/ARCHITECTURE.md) - System architecture
- [Collaboration](../implementation/collaboration.md) - Real-time collaboration details
