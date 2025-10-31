// GPS Tracker Module for Superacao App
class GPSTracker {
    constructor() {
        this.isTracking = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalDistance = 0;
        this.lastPosition = null;
        this.positions = [];
        this.currentActivity = null;
        this.watchId = null;
        this.timer = null;
        this.map = null;
        this.mapMarkers = [];
        this.routeLine = null;
        
        // Activity specific data
        this.activityData = {
            walking: { caloriesPerKm: 50, avgSpeed: 5 },
            running: { caloriesPerKm: 70, avgSpeed: 10 },
            cycling: { caloriesPerKm: 30, avgSpeed: 20 }
        };
    }

    // Initialize GPS Tracker
    init() {
        this.checkGeolocationSupport();
        this.setupEventListeners();
    }

    // Check if geolocation is supported
    checkGeolocationSupport() {
        if (!navigator.geolocation) {
            this.showError('Geolocalização não é suportada pelo seu navegador');
            return false;
        }
        return true;
    }

    // Setup event listeners
    setupEventListeners() {
        // Request permission on first interaction
        document.addEventListener('click', () => {
            this.requestLocationPermission();
        }, { once: true });
    }

    // Request location permission
    async requestLocationPermission() {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            
            if (permission.state === 'denied') {
                this.showError('Permissão de localização negada. Ative nas configurações do navegador.');
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('Permission API not supported, will request on GPS start');
            return true;
        }
    }

    // Show GPS Tracker Modal
    showModal() {
        const modal = document.getElementById('gpsTrackerModal');
        if (modal) {
            this.resetInterface();
            modal.style.display = 'flex';
        }
    }

    // Close GPS Tracker Modal
    closeModal() {
        const modal = document.getElementById('gpsTrackerModal');
        if (modal) {
            if (this.isTracking) {
                const confirm = window.confirm('Você tem uma atividade em andamento. Deseja realmente fechar?');
                if (!confirm) return;
                this.stopTracking();
            }
            modal.style.display = 'none';
        }
    }

    // Reset interface to initial state
    resetInterface() {
        // Show activity selection
        document.getElementById('activitySelection').style.display = 'block';
        document.getElementById('gpsTrackingInterface').style.display = 'none';
        document.getElementById('activitySummary').style.display = 'none';
        
        // Reset activity selection
        document.querySelectorAll('.activity-type-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Disable start button
        document.querySelector('.btn-start-tracking').disabled = true;
        
        // Reset metrics
        this.resetMetrics();
    }

    // Select activity type
    selectActivity(activityType) {
        this.currentActivity = activityType;
        
        // Update UI
        document.querySelectorAll('.activity-type-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.querySelector(`[data-activity="${activityType}"]`).classList.add('selected');
        document.querySelector('.btn-start-tracking').disabled = false;
    }

    // Start GPS tracking
    async startTracking() {
        if (!this.checkGeolocationSupport()) return;
        
        try {
            // Reset tracking data
            this.totalDistance = 0;
            this.positions = [];
            this.lastPosition = null;
            this.startTime = new Date();
            this.pausedTime = 0;
            this.isTracking = true;
            this.isPaused = false;
            
            // Show tracking interface
            document.getElementById('activitySelection').style.display = 'none';
            document.getElementById('gpsTrackingInterface').style.display = 'block';
            
            // Start position watching
            this.startPositionWatching();
            
            // Start timer
            this.startTimer();
            
            // Initialize map
            this.initMap();
            
            // Show notification
            this.showNotification('GPS ativado! Rastreamento iniciado.', 'success');
            
        } catch (error) {
            this.showError('Erro ao iniciar rastreamento: ' + error.message);
        }
    }

    // Start position watching
    startPositionWatching() {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => this.handlePositionError(error),
            options
        );
    }

    // Handle position update
    handlePositionUpdate(position) {
        if (!this.isTracking || this.isPaused) return;

        const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            altitude: position.coords.altitude || 0,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || 0
        };

        // Add to positions array
        this.positions.push(newPosition);

        // Calculate distance if we have a previous position
        if (this.lastPosition) {
            const distance = this.calculateDistance(this.lastPosition, newPosition);
            this.totalDistance += distance;
        }

        this.lastPosition = newPosition;

        // Update metrics display
        this.updateMetrics(newPosition);
        
        // Update map
        this.updateMap(newPosition);
    }

    // Handle position error
    handlePositionError(error) {
        let message = 'Erro de GPS: ';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permissão negada. Ative a localização nas configurações.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Localização indisponível.';
                break;
            case error.TIMEOUT:
                message += 'Tempo limite excedido.';
                break;
            default:
                message += 'Erro desconhecido.';
                break;
        }
        
        this.showError(message);
    }

    // Calculate distance between two points (Haversine formula)
    calculateDistance(pos1, pos2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(pos2.lat - pos1.lat);
        const dLng = this.toRadians(pos2.lng - pos1.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(pos1.lat)) * Math.cos(this.toRadians(pos2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Start timer
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.updateTimeDisplay();
            }
        }, 1000);
    }

    // Update time display
    updateTimeDisplay() {
        if (!this.startTime) return;
        
        const elapsed = new Date() - this.startTime - this.pausedTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timeValue').textContent = timeString;
    }

    // Update metrics display
    updateMetrics(position) {
        // Distance
        document.getElementById('distanceValue').textContent = `${this.totalDistance.toFixed(2)} km`;
        
        // Speed (convert m/s to km/h)
        const speedKmh = (position.speed || 0) * 3.6;
        document.getElementById('speedValue').textContent = `${speedKmh.toFixed(1)} km/h`;
        
        // Altitude
        document.getElementById('altitudeValue').textContent = `${Math.round(position.altitude || 0)} m`;
        
        // Calculate calories
        const calories = this.calculateCalories();
        document.getElementById('caloriesValue').textContent = `${Math.round(calories)} kcal`;
        
        // Calculate pace (minutes per km)
        const pace = this.calculatePace();
        document.getElementById('paceValue').textContent = pace;
    }

    // Calculate calories burned
    calculateCalories() {
        if (!this.currentActivity || !this.activityData[this.currentActivity]) return 0;
        
        const caloriesPerKm = this.activityData[this.currentActivity].caloriesPerKm;
        return this.totalDistance * caloriesPerKm;
    }

    // Calculate pace (minutes per kilometer)
    calculatePace() {
        if (!this.startTime || this.totalDistance === 0) return "0'00\"";
        
        const elapsed = (new Date() - this.startTime - this.pausedTime) / 1000 / 60; // minutes
        const paceMinutes = elapsed / this.totalDistance;
        
        if (!isFinite(paceMinutes)) return "0'00\"";
        
        const minutes = Math.floor(paceMinutes);
        const seconds = Math.round((paceMinutes - minutes) * 60);
        
        return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
    }

    // Initialize map (placeholder for now)
    initMap() {
        const mapContainer = document.getElementById('gpsMap');
        mapContainer.innerHTML = `
            <div class="map-placeholder">
                <i class="fas fa-map-marked-alt"></i>
                <p>Rastreando localização...</p>
                <small>Mapa será exibido quando a localização for obtida</small>
            </div>
        `;
    }

    // Update map with new position
    updateMap(position) {
        // This is a placeholder implementation
        // In a real app, you would integrate with a mapping service like Google Maps or Leaflet
        const mapContainer = document.getElementById('gpsMap');
        mapContainer.innerHTML = `
            <div class="map-placeholder">
                <i class="fas fa-crosshairs" style="color: #4CAF50;"></i>
                <p><strong>Posição Atual</strong></p>
                <small>Lat: ${position.lat.toFixed(6)}</small><br>
                <small>Lng: ${position.lng.toFixed(6)}</small><br>
                <small>Precisão: ±${Math.round(position.accuracy)}m</small>
            </div>
        `;
    }

    // Pause tracking
    pauseTracking() {
        if (!this.isTracking || this.isPaused) return;
        
        this.isPaused = true;
        this.pauseStartTime = new Date();
        
        // Update UI
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('resumeBtn').style.display = 'block';
        
        this.showNotification('Rastreamento pausado', 'info');
    }

    // Resume tracking
    resumeTracking() {
        if (!this.isTracking || !this.isPaused) return;
        
        this.isPaused = false;
        
        if (this.pauseStartTime) {
            this.pausedTime += new Date() - this.pauseStartTime;
        }
        
        // Update UI
        document.getElementById('pauseBtn').style.display = 'block';
        document.getElementById('resumeBtn').style.display = 'none';
        
        this.showNotification('Rastreamento retomado', 'success');
    }

    // Stop tracking
    stopTracking() {
        if (!this.isTracking) return;
        
        this.isTracking = false;
        this.isPaused = false;
        
        // Stop position watching
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Show summary
        this.showActivitySummary();
    }

    // Show activity summary
    showActivitySummary() {
        // Hide tracking interface
        document.getElementById('gpsTrackingInterface').style.display = 'none';
        
        // Show summary
        document.getElementById('activitySummary').style.display = 'block';
        
        // Calculate final metrics
        const totalTime = new Date() - this.startTime - this.pausedTime;
        const hours = Math.floor(totalTime / 3600000);
        const minutes = Math.floor((totalTime % 3600000) / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const avgSpeed = totalTime > 0 ? (this.totalDistance / (totalTime / 3600000)) : 0;
        const calories = this.calculateCalories();
        
        // Update summary display
        document.getElementById('summaryDistance').textContent = `${this.totalDistance.toFixed(2)} km`;
        document.getElementById('summaryTime').textContent = timeString;
        document.getElementById('summaryAvgSpeed').textContent = `${avgSpeed.toFixed(1)} km/h`;
        document.getElementById('summaryCalories').textContent = `${Math.round(calories)} kcal`;
    }

    // Save activity
    saveActivity() {
        try {
            const activityData = {
                id: Date.now().toString(),
                type: this.currentActivity,
                date: new Date().toISOString(),
                startTime: this.startTime.toISOString(),
                totalTime: new Date() - this.startTime - this.pausedTime,
                distance: this.totalDistance,
                calories: this.calculateCalories(),
                positions: this.positions,
                avgSpeed: this.totalDistance / ((new Date() - this.startTime - this.pausedTime) / 3600000)
            };
            
            // Save to localStorage (in a real app, this would go to a database)
            let activities = JSON.parse(localStorage.getItem('gps_activities') || '[]');
            activities.push(activityData);
            localStorage.setItem('gps_activities', JSON.stringify(activities));
            
            // Add points to user
            this.addActivityPoints(activityData);
            
            this.showNotification('Atividade salva com sucesso!', 'success');
            this.closeModal();
            
        } catch (error) {
            this.showError('Erro ao salvar atividade: ' + error.message);
        }
    }

    // Add points for activity
    addActivityPoints(activityData) {
        try {
            // Calculate points based on activity
            const basePoints = Math.round(activityData.distance * 10); // 10 points per km
            const timeBonus = Math.round(activityData.totalTime / 60000); // 1 point per minute
            const totalPoints = basePoints + timeBonus;
            
            // Add to user's total points
            if (window.app && window.app.addPoints) {
                window.app.addPoints(totalPoints, `Atividade ${activityData.type}: ${activityData.distance.toFixed(2)}km`);
            }
        } catch (error) {
            console.error('Error adding activity points:', error);
        }
    }

    // Discard activity
    discardActivity() {
        const confirm = window.confirm('Tem certeza que deseja descartar esta atividade?');
        if (confirm) {
            this.resetInterface();
        }
    }

    // Reset metrics display
    resetMetrics() {
        document.getElementById('distanceValue').textContent = '0.00 km';
        document.getElementById('timeValue').textContent = '00:00:00';
        document.getElementById('speedValue').textContent = '0.0 km/h';
        document.getElementById('caloriesValue').textContent = '0 kcal';
        document.getElementById('paceValue').textContent = "0'00\"/km";
        document.getElementById('altitudeValue').textContent = '0 m';
    }

    // Center map on current position
    centerMap() {
        if (this.lastPosition) {
            this.showNotification('Mapa centralizado na posição atual', 'info');
        } else {
            this.showNotification('Nenhuma posição disponível', 'warning');
        }
    }

    // Toggle map type
    toggleMapType() {
        this.showNotification('Tipo de mapa alterado', 'info');
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Show error
    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize GPS Tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gpsTracker = new GPSTracker();
    window.gpsTracker.init();
});

// Global functions for HTML onclick handlers
function showGpsTrackerModal() {
    window.gpsTracker.showModal();
}

function closeGpsTrackerModal() {
    window.gpsTracker.closeModal();
}

function selectActivity(activityType) {
    window.gpsTracker.selectActivity(activityType);
}

function startGpsTracking() {
    window.gpsTracker.startTracking();
}

function pauseTracking() {
    window.gpsTracker.pauseTracking();
}

function resumeTracking() {
    window.gpsTracker.resumeTracking();
}

function stopTracking() {
    window.gpsTracker.stopTracking();
}

function saveActivity() {
    window.gpsTracker.saveActivity();
}

function discardActivity() {
    window.gpsTracker.discardActivity();
}

function centerMap() {
    window.gpsTracker.centerMap();
}

function toggleMapType() {
    window.gpsTracker.toggleMapType();
}