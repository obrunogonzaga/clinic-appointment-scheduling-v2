# Troubleshooting Guide

## Common Issues and Solutions

### Docker Issues

#### Issue: Docker containers won't start
**Symptoms**: `docker-compose up` fails with connection errors

**Solutions**:
1. Check if Docker Desktop is running
   ```bash
   docker info
   ```

2. Clean up existing containers and volumes
   ```bash
   docker-compose -f docker/docker-compose.yml down -v
   docker system prune -a
   ```

3. Check port conflicts
   ```bash
   # Check if ports are in use
   lsof -i :8000  # API
   lsof -i :27017 # MongoDB
   lsof -i :6379  # Redis
   lsof -i :8081  # Mongo Express
   ```

4. Rebuild containers
   ```bash
   docker-compose -f docker/docker-compose.yml build --no-cache
   ```

#### Issue: MongoDB connection refused
**Symptoms**: API can't connect to MongoDB

**Solutions**:
1. Check MongoDB container logs
   ```bash
   docker logs lab_scheduler_mongodb
   ```

2. Verify environment variables
   ```bash
   # In backend/.env
   MONGODB_URL=mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin
   ```

3. Test MongoDB connection directly
   ```bash
   docker exec -it lab_scheduler_mongodb mongosh -u admin -p admin123
   ```

### Backend (Python/FastAPI) Issues

#### Issue: ModuleNotFoundError
**Symptoms**: Python can't find installed packages

**Solutions**:
1. Ensure virtual environment is activated
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

2. Reinstall dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Check Python version
   ```bash
   python --version  # Should be 3.8+
   ```

#### Issue: FastAPI won't start
**Symptoms**: `uvicorn` command fails

**Solutions**:
1. Check for syntax errors
   ```bash
   python -m py_compile src/main.py
   ```

2. Verify port availability
   ```bash
   lsof -i :8000
   ```

3. Run with detailed logging
   ```bash
   uvicorn src.main:app --reload --log-level debug
   ```

#### Issue: Pydantic validation errors
**Symptoms**: 422 Unprocessable Entity errors

**Solutions**:
1. Check request payload format
2. Verify required fields are present
3. Check data types match schema
4. Enable detailed error responses:
   ```python
   # In main.py
   app = FastAPI(debug=True)
   ```

### Frontend (React/Vite) Issues

#### Issue: npm install fails
**Symptoms**: Dependency resolution errors

**Solutions**:
1. Clear npm cache
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node version
   ```bash
   node --version  # Should be 16+
   ```

#### Issue: Vite dev server won't start
**Symptoms**: Port already in use or build errors

**Solutions**:
1. Kill process on port 5173
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

2. Check for TypeScript errors
   ```bash
   npm run type-check
   ```

3. Clear Vite cache
   ```bash
   rm -rf node_modules/.vite
   ```

#### Issue: CORS errors in browser
**Symptoms**: Blocked by CORS policy

**Solutions**:
1. Check backend CORS configuration
   ```python
   # In backend/src/core/config.py
   CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
   ```

2. Verify API URL in frontend
   ```javascript
   // In frontend/.env
   VITE_API_URL=http://localhost:8000
   ```

3. Use proxy in development
   ```javascript
   // In vite.config.js
   proxy: {
     '/api': 'http://localhost:8000'
   }
   ```

### Database Issues

#### Issue: MongoDB "too many open connections"
**Symptoms**: Connection pool exhausted

**Solutions**:
1. Increase connection pool size
   ```python
   # In backend/src/db/mongodb.py
   client = AsyncIOMotorClient(
       MONGODB_URL,
       maxPoolSize=50,
       minPoolSize=10
   )
   ```

2. Check for connection leaks
   ```python
   # Ensure connections are closed
   async def get_database():
       try:
           yield database
       finally:
           # Connection cleanup if needed
           pass
   ```

#### Issue: Slow queries
**Symptoms**: API endpoints timing out

**Solutions**:
1. Check indexes
   ```javascript
   // In MongoDB shell
   db.patients.getIndexes()
   ```

2. Add missing indexes
   ```javascript
   db.patients.createIndex({ "cpf": 1 }, { unique: true })
   db.appointments.createIndex({ "date": 1, "status": 1 })
   ```

3. Use explain to analyze queries
   ```javascript
   db.patients.find({ status: "active" }).explain("executionStats")
   ```

### Authentication Issues

#### Issue: JWT token invalid
**Symptoms**: 401 Unauthorized errors

**Solutions**:
1. Check token expiration
   ```python
   # In backend/src/core/config.py
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   ```

2. Verify JWT secret
   ```bash
   # In .env
   JWT_SECRET=your-secret-key-here
   ```

3. Check token format in requests
   ```bash
   # Header should be:
   Authorization: Bearer <token>
   ```

### Performance Issues

#### Issue: Slow API responses
**Symptoms**: Endpoints taking > 2 seconds

**Solutions**:
1. Enable query profiling
   ```javascript
   // MongoDB profiling
   db.setProfilingLevel(1, { slowms: 100 })
   ```

2. Implement caching
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   async def get_patient_cached(patient_id: str):
       # Cached query
   ```

3. Use pagination
   ```python
   # Limit results
   patients = await db.patients.find().limit(20).to_list()
   ```

### Deployment Issues

#### Issue: Environment variables not loading
**Symptoms**: Settings using defaults instead of env values

**Solutions**:
1. Check .env file location
   ```bash
   # Should be in backend/.env
   ls -la backend/.env
   ```

2. Verify python-dotenv is installed
   ```bash
   pip install python-dotenv
   ```

3. Load env vars explicitly
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

## Debugging Tools

### Backend Debugging

1. **Interactive debugger**
   ```python
   import pdb; pdb.set_trace()
   ```

2. **Logging**
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   logger = logging.getLogger(__name__)
   ```

3. **API request inspection**
   ```python
   @app.middleware("http")
   async def log_requests(request: Request, call_next):
       logger.info(f"{request.method} {request.url}")
       response = await call_next(request)
       return response
   ```

### Frontend Debugging

1. **React Developer Tools**
   - Install browser extension
   - Inspect component props and state

2. **Network inspection**
   ```javascript
   // Log all API calls
   axios.interceptors.request.use(request => {
       console.log('Starting Request:', request)
       return request
   })
   ```

3. **Redux DevTools** (if using Redux)
   ```javascript
   const store = createStore(
       reducer,
       window.__REDUX_DEVTOOLS_EXTENSION__?.()
   )
   ```

### Database Debugging

1. **MongoDB Compass**
   - GUI for MongoDB inspection
   - Query performance analysis

2. **Mongo Shell queries**
   ```javascript
   // Check collection stats
   db.patients.stats()
   
   // Current operations
   db.currentOp()
   ```

## Error Codes Reference

### API Error Codes
- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Missing or invalid token
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource doesn't exist
- `409` - Conflict: Duplicate resource
- `422` - Unprocessable: Validation failed
- `429` - Too Many Requests: Rate limited
- `500` - Internal Error: Server error
- `503` - Service Unavailable: Temporary issue

### Custom Error Codes
- `AUTH001` - Invalid credentials
- `AUTH002` - Token expired
- `AUTH003` - Refresh token invalid
- `VAL001` - Invalid CPF format
- `VAL002` - Invalid email format
- `VAL003` - Required field missing
- `BUS001` - Appointment slot taken
- `BUS002` - Patient already exists
- `BUS003` - Cannot cancel past appointment

## Monitoring and Logs

### Log Locations
- **Backend logs**: `backend/logs/app.log`
- **Docker logs**: `docker logs <container_name>`
- **MongoDB logs**: `docker logs lab_scheduler_mongodb`
- **Frontend console**: Browser DevTools

### Log Analysis
```bash
# Search for errors
grep ERROR backend/logs/app.log

# Follow logs in real-time
tail -f backend/logs/app.log

# Docker logs with timestamps
docker logs -f --timestamps lab_scheduler_api
```

## Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search error messages in project issues
3. Check logs for stack traces
4. Try solutions in isolated environment

### When Reporting Issues
Include:
- Error message and stack trace
- Steps to reproduce
- Environment details (OS, versions)
- Recent changes made
- Logs from relevant services

### Resources
- Project Issues: GitHub Issues page
- Documentation: `/docs` folder
- API Docs: `http://localhost:8000/docs`
- Community: Project Slack/Discord