# Onboard API Server

Modern Ruby API server for Jekyll content management. Built with **Roda** (routing tree web framework), **Shrine** (file uploads), and **libvips** (image processing).

**Port**: 4001 (Jekyll runs on 4000)
**Security**: Localhost-only (Rack::Attack enforcement)
**Architecture**: Modular, atomic, tokenized, variableized

---

## 🏗️ Architecture

### Technology Stack (October 2025 Best Practices)

| Component | Technology | Why |
|-----------|------------|-----|
| **Framework** | Roda 3.84 | 3.2x faster than Sinatra, modular routing tree |
| **Image Processing** | libvips + ruby-vips 2.2 | 10x faster, 90% less memory vs ImageMagick |
| **File Uploads** | Shrine 3.6 | Streaming-first, cloud-native |
| **Security** | Rack::Attack 6.7 | Localhost-only, CVE protection |
| **Validation** | dry-validation 1.10 | Type-safe input validation |
| **Process Manager** | Overmind | tmux-based, active maintenance |

### Directory Structure

```
api/
├── config.ru              # Rack entry point
├── Gemfile                # Dependencies
├── app.rb                 # Main Roda app (routing)
├── config/
│   ├── constants.rb       # Tokenized constants (DRY)
│   └── security.rb        # Rack::Attack config
├── routes/                # Modular route handlers
│   ├── content.rb         # (Week 2)
│   ├── upload.rb          # (Week 3)
│   └── config.rb          # (Week 2)
├── services/              # Business logic (atomic)
│   ├── config_writer.rb   # (Week 2)
│   └── image_processor.rb # (Week 3)
├── lib/
│   └── validators/        # Input validators
└── tmp/                   # Temporary uploads
```

---

## 🚀 Setup

### Prerequisites

**1. System Dependencies**

```bash
# macOS
brew install vips tmux

# Linux (Ubuntu/Debian)
sudo apt-get install libvips libvips-dev tmux

# Or use the automated script
./setup_libvips.sh
```

**2. Verify Installation**

```bash
vips --version  # Should be 8.5+
tmux -V         # Should be 2.0+
```

### Installation

**1. Install API gems**

```bash
cd api
bundle install
```

**2. Return to project root**

```bash
cd ..
```

**3. Install Overmind (if needed)**

```bash
gem install overmind

# or via package manager
brew install overmind  # macOS
```

---

## 🏃 Running

### Option 1: Overmind (Recommended)

**Start both Jekyll and API**:
```bash
overmind start
```

**Access**:
- Jekyll: http://localhost:4000/
- API: http://localhost:4001/
- API Docs: http://localhost:4001/api/docs

**Overmind Commands**:
```bash
overmind start          # Start all processes
overmind restart api    # Restart only API
overmind connect api    # Connect to API (interactive)
overmind kill           # Stop all
```

### Option 2: Manual (rackup)

**Terminal 1** (Jekyll):
```bash
bundle exec jekyll serve --port 4000 --livereload
```

**Terminal 2** (API):
```bash
cd api && bundle exec rackup config.ru -p 4001
```

### Option 3: Puma

```bash
cd api
bundle exec puma config.ru -p 4001
```

---

## 📡 API Endpoints

### Config Management

```bash
# Get configuration
curl http://localhost:4001/api/config

# Update configuration (Week 2)
curl -X POST http://localhost:4001/api/config \
  -H "Content-Type: application/json" \
  -d '{"config": {...}}'
```

### Content Management

```bash
# Get hero section
curl http://localhost:4001/api/content/hero

# Get services
curl http://localhost:4001/api/content/services

# Get portfolio
curl http://localhost:4001/api/content/portfolio

# Update (Week 2)
curl -X POST http://localhost:4001/api/content/hero \
  -H "Content-Type: application/json" \
  -d '{"hero": {...}}'
```

### File Upload (Week 3)

```bash
# Upload image
curl -X POST http://localhost:4001/api/upload \
  -F "file=@image.jpg"
```

### Meta Endpoints

```bash
# API status
curl http://localhost:4001/

# Health check
curl http://localhost:4001/health

# API documentation
curl http://localhost:4001/api/docs
```

---

## 🔒 Security

### Localhost-Only Enforcement

**Rack::Attack Configuration** (`config/security.rb`):

1. **Safelist**: Allows 127.0.0.1, ::1, localhost
2. **Blocklist**: Denies all non-localhost IPs
3. **Throttle**: Rate limits (100 req/min, 10 uploads/5min)

**Testing**:
```bash
# Allowed
curl http://localhost:4001/api/config
# => {"success":true,...}

# Blocked (if accessed from another machine)
curl http://192.168.1.100:4001/api/config
# => {"error":"Unauthorized: API only accessible from localhost"}
```

### 2025 CVE Protection

- **Rack 3.0+**: Includes patches for CVE-2025-27610, CVE-2025-27111, CVE-2025-25184
- **Input validation**: dry-validation prevents injection
- **Rate limiting**: Prevents DoS attacks

---

## 🏗️ Architecture Principles

### Modular (Not Monolithic)

```ruby
# ❌ Monolithic
def handle_everything
  validate
  write_config
  process_image
  send_response
end

# ✅ Modular
ConfigWriter.write(data)  # Atomic service
ImageProcessor.optimize(file)  # Atomic service
```

### Tokenized (No Magic Numbers)

```ruby
# ❌ Hardcoded
if file_size > 10485760  # What is this number?

# ✅ Tokenized
if file_size > Constants::MAX_IMAGE_SIZE  # Clear intent
```

### Variableized (DRY)

```ruby
# ❌ Hardcoded paths
File.join('/home/user/project', 'uploads', filename)

# ✅ Variableized
Constants.upload_path(filename)  # Calculated once
```

### Cascading (Hierarchical Routing)

```ruby
# Roda routing tree (efficient)
r.on 'api' do
  r.on 'content' do  # Only checked if /api matched
    r.on 'hero' do   # Only checked if /api/content matched
      # handler
    end
  end
end
```

---

## 🧪 Testing

### Manual Testing

```bash
# 1. API status
curl http://localhost:4001/

# 2. Health check
curl http://localhost:4001/health

# 3. Get config
curl http://localhost:4001/api/config

# 4. Get content
curl http://localhost:4001/api/content/hero

# 5. Check docs
curl http://localhost:4001/api/docs
```

### Automated Tests (Week 5)

```bash
cd api
bundle exec rspec
```

---

## 📊 Performance

### Benchmarks

| Metric | Value | Comparison |
|--------|-------|------------|
| **Roda** | 9,252 req/s | 3.2x faster than Sinatra |
| **libvips** | 10x faster | vs ImageMagick |
| **libvips memory** | 200MB | 93% less than ImageMagick (3GB) |
| **Bundle size** | ~15MB | Minimal dependencies |

### Optimization

- **Gzip compression**: Rack::Deflater middleware
- **Auto-reload**: Rack::Reloader (dev only, no restart needed)
- **Efficient routing**: Roda's tree structure
- **Streaming uploads**: Shrine HTTP.rb integration

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 4001
lsof -ti:4001

# Kill process
lsof -ti:4001 | xargs kill -9
```

### libvips Not Found

```bash
# Automated install
./setup_libvips.sh

# Manual install
brew install vips                # macOS
sudo apt-get install libvips     # Linux
```

### Gems Won't Install

```bash
# Update bundler
gem update bundler

# Re-install
cd api
rm Gemfile.lock
bundle install
```

### API Won't Start

```bash
# Check Gemfile
cd api && bundle check

# Check Ruby version
ruby -v  # Should be 3.0+

# Check logs
overmind connect api  # See real-time output
```

### Security: Blocked Requests

```bash
# Ensure accessing from localhost
curl http://127.0.0.1:4001/  # ✅ Works
curl http://localhost:4001/   # ✅ Works
curl http://192.168.1.x:4001/ # ❌ Blocked
```

---

## 📚 Week-by-Week Roadmap

### ✅ Week 1: Foundation (Complete)
- [x] Roda API server setup
- [x] Rack::Attack security
- [x] Procfile for Overmind
- [x] Tokenized constants
- [x] Modular architecture

### 🔄 Week 2: Content CRUD (Current)
- [ ] dry-validation schemas
- [ ] Config write service (with file locking)
- [ ] Content update endpoints
- [ ] Modular route files

### 📅 Week 3: Image Upload
- [ ] Shrine integration
- [ ] libvips processing
- [ ] WebP optimization
- [ ] Upload endpoints

### 📅 Week 4: Frontend
- [ ] TypeScript API client
- [ ] Content editor UI
- [ ] Image upload UI

### 📅 Week 5: Polish
- [ ] Automated tests
- [ ] Documentation
- [ ] Security audit

---

## 🔗 References

- **Roda**: https://roda.jeremyevans.net/
- **libvips**: https://www.libvips.org/
- **Shrine**: https://shrinerb.com/
- **Rack::Attack**: https://github.com/rack/rack-attack
- **Overmind**: https://github.com/DarthSim/overmind

---

## 📝 Design Decisions

See `docs/01-project/03-plans/15-20251002-002.07-phase-8-content-editor.md` for comprehensive research and technology comparisons.

**Key Choices**:
1. **Roda over Sinatra**: 3.2x faster, modular plugins
2. **libvips over ImageMagick**: 10x faster, 90% less memory
3. **Shrine over CarrierWave**: Streaming-first, modern
4. **Overmind over Foreman**: Individual control, tmux, maintained

---

**Status**: ✅ Week 1 Complete | 🔄 Week 2 In Progress
**Last Updated**: October 2, 2025
