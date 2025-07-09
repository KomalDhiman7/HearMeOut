from flask import Blueprint, request, jsonify
from flask_socketio import emit
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

emergency_bp = Blueprint('emergency', __name__)

# In-memory storage for emergency alerts (in production, use a database)
emergency_alerts = []
active_emergencies = {}

# Emergency contact information (in production, this would be configurable)
EMERGENCY_CONTACTS = {
    'general': '911',
    'medical': '911',
    'fire': '911',
    'police': '911',
    'poison_control': '1-800-222-1222',
    'suicide_prevention': '988'
}

@emergency_bp.route('/trigger', methods=['POST'])
def trigger_emergency():
    """Trigger an emergency alert"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Emergency data required'}), 400
        
        emergency_type = data.get('type', 'general')
        message = data.get('message', 'Emergency assistance needed')
        location = data.get('location', 'Unknown location')
        user_id = data.get('user_id', 'anonymous')
        severity = data.get('severity', 'high')  # low, medium, high, critical
        
        # Create emergency alert
        alert_id = f"emergency_{int(time.time())}_{user_id}"
        
        emergency_alert = {
            'id': alert_id,
            'type': emergency_type,
            'message': message,
            'location': location,
            'user_id': user_id,
            'severity': severity,
            'timestamp': datetime.now().isoformat(),
            'status': 'active',
            'response_time': None,
            'resolved_at': None,
            'contacts_notified': [],
            'metadata': {
                'user_agent': request.headers.get('User-Agent', ''),
                'ip_address': request.remote_addr,
                'triggered_by': data.get('triggered_by', 'manual')
            }
        }
        
        # Store alert
        emergency_alerts.append(emergency_alert)
        active_emergencies[alert_id] = emergency_alert
        
        # Determine emergency contacts based on type
        emergency_contact = EMERGENCY_CONTACTS.get(emergency_type, EMERGENCY_CONTACTS['general'])
        
        # Log emergency
        logger.critical(f"EMERGENCY TRIGGERED: {emergency_type} - {message} - Location: {location} - User: {user_id}")
        
        # Broadcast emergency to all connected clients via WebSocket
        try:
            from flask import current_app
            if hasattr(current_app, 'socketio'):
                current_app.socketio.emit('emergency_alert', {
                    'alert_id': alert_id,
                    'type': emergency_type,
                    'message': message,
                    'location': location,
                    'severity': severity,
                    'timestamp': emergency_alert['timestamp'],
                    'emergency_contact': emergency_contact
                })
        except Exception as e:
            logger.error(f"Failed to broadcast emergency via WebSocket: {e}")
        
        return jsonify({
            'success': True,
            'alert_id': alert_id,
            'emergency_contact': emergency_contact,
            'message': 'Emergency alert triggered successfully',
            'alert': emergency_alert
        })
        
    except Exception as e:
        logger.error(f"Emergency trigger error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/status/<alert_id>', methods=['GET'])
def get_emergency_status(alert_id):
    """Get status of a specific emergency alert"""
    try:
        alert = active_emergencies.get(alert_id)
        
        if not alert:
            return jsonify({
                'success': False,
                'error': 'Emergency alert not found'
            }), 404
        
        return jsonify({
            'success': True,
            'alert': alert,
            'is_active': alert['status'] == 'active'
        })
        
    except Exception as e:
        logger.error(f"Error getting emergency status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/resolve/<alert_id>', methods=['POST'])
def resolve_emergency(alert_id):
    """Mark an emergency as resolved"""
    try:
        data = request.get_json() or {}
        resolution_notes = data.get('notes', 'Emergency resolved')
        resolved_by = data.get('resolved_by', 'system')
        
        alert = active_emergencies.get(alert_id)
        
        if not alert:
            return jsonify({
                'success': False,
                'error': 'Emergency alert not found'
            }), 404
        
        # Update alert
        alert['status'] = 'resolved'
        alert['resolved_at'] = datetime.now().isoformat()
        alert['resolution_notes'] = resolution_notes
        alert['resolved_by'] = resolved_by
        
        # Calculate response time
        triggered_time = datetime.fromisoformat(alert['timestamp'])
        resolved_time = datetime.now()
        response_time = (resolved_time - triggered_time).total_seconds()
        alert['response_time'] = response_time
        
        # Remove from active emergencies
        del active_emergencies[alert_id]
        
        logger.info(f"Emergency {alert_id} resolved by {resolved_by}. Response time: {response_time:.1f} seconds")
        
        # Broadcast resolution
        try:
            from flask import current_app
            if hasattr(current_app, 'socketio'):
                current_app.socketio.emit('emergency_resolved', {
                    'alert_id': alert_id,
                    'resolved_by': resolved_by,
                    'response_time': response_time,
                    'notes': resolution_notes
                })
        except Exception as e:
            logger.error(f"Failed to broadcast emergency resolution: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Emergency resolved successfully',
            'alert': alert,
            'response_time_seconds': response_time
        })
        
    except Exception as e:
        logger.error(f"Error resolving emergency: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/active', methods=['GET'])
def get_active_emergencies():
    """Get all active emergency alerts"""
    try:
        active_alerts = list(active_emergencies.values())
        
        # Sort by severity and timestamp
        severity_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        active_alerts.sort(
            key=lambda x: (severity_order.get(x['severity'], 0), x['timestamp']), 
            reverse=True
        )
        
        return jsonify({
            'success': True,
            'active_emergencies': active_alerts,
            'count': len(active_alerts)
        })
        
    except Exception as e:
        logger.error(f"Error getting active emergencies: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/history', methods=['GET'])
def get_emergency_history():
    """Get emergency alert history"""
    try:
        limit = int(request.args.get('limit', 50))
        user_id = request.args.get('user_id', None)
        
        # Filter alerts
        filtered_alerts = emergency_alerts
        if user_id:
            filtered_alerts = [alert for alert in emergency_alerts if alert['user_id'] == user_id]
        
        # Sort by timestamp (newest first)
        sorted_alerts = sorted(filtered_alerts, key=lambda x: x['timestamp'], reverse=True)
        
        # Limit results
        limited_alerts = sorted_alerts[:limit]
        
        return jsonify({
            'success': True,
            'alerts': limited_alerts,
            'total_count': len(filtered_alerts),
            'returned_count': len(limited_alerts)
        })
        
    except Exception as e:
        logger.error(f"Error getting emergency history: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/contacts', methods=['GET'])
def get_emergency_contacts():
    """Get emergency contact information"""
    try:
        return jsonify({
            'success': True,
            'contacts': EMERGENCY_CONTACTS,
            'note': 'In the US, dial 911 for immediate emergency assistance'
        })
        
    except Exception as e:
        logger.error(f"Error getting emergency contacts: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/test', methods=['POST'])
def test_emergency_system():
    """Test the emergency system (non-actual emergency)"""
    try:
        # Create a test emergency alert
        test_alert = {
            'id': f"test_{int(time.time())}",
            'type': 'test',
            'message': 'This is a test of the emergency alert system',
            'location': 'Test location',
            'user_id': 'test_user',
            'severity': 'low',
            'timestamp': datetime.now().isoformat(),
            'status': 'test',
            'is_test': True
        }
        
        logger.info("Emergency system test performed successfully")
        
        return jsonify({
            'success': True,
            'message': 'Emergency system test completed',
            'test_alert': test_alert,
            'available_contacts': EMERGENCY_CONTACTS
        })
        
    except Exception as e:
        logger.error(f"Emergency test error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/stats', methods=['GET'])
def get_emergency_stats():
    """Get emergency system statistics"""
    try:
        now = datetime.now()
        last_24h = now - timedelta(hours=24)
        last_week = now - timedelta(days=7)
        
        # Calculate statistics
        total_alerts = len(emergency_alerts)
        active_count = len(active_emergencies)
        
        # Alerts in last 24 hours
        recent_alerts = [
            alert for alert in emergency_alerts 
            if datetime.fromisoformat(alert['timestamp']) > last_24h
        ]
        
        # Alerts in last week
        weekly_alerts = [
            alert for alert in emergency_alerts 
            if datetime.fromisoformat(alert['timestamp']) > last_week
        ]
        
        # Calculate average response time for resolved alerts
        resolved_alerts = [alert for alert in emergency_alerts if alert.get('response_time')]
        avg_response_time = sum(alert['response_time'] for alert in resolved_alerts) / len(resolved_alerts) if resolved_alerts else 0
        
        # Group by type
        alert_types = {}
        for alert in emergency_alerts:
            alert_type = alert['type']
            alert_types[alert_type] = alert_types.get(alert_type, 0) + 1
        
        # Group by severity
        severity_stats = {}
        for alert in emergency_alerts:
            severity = alert['severity']
            severity_stats[severity] = severity_stats.get(severity, 0) + 1
        
        stats = {
            'total_alerts': total_alerts,
            'active_emergencies': active_count,
            'alerts_last_24h': len(recent_alerts),
            'alerts_last_week': len(weekly_alerts),
            'average_response_time_seconds': round(avg_response_time, 2),
            'alert_types': alert_types,
            'severity_distribution': severity_stats,
            'resolution_rate': round((total_alerts - active_count) / max(total_alerts, 1) * 100, 2)
        }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'generated_at': now.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating emergency stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emergency_bp.route('/notify', methods=['POST'])
def notify_emergency_contacts():
    """Notify emergency contacts (simulation)"""
    try:
        data = request.get_json()
        
        if not data or 'alert_id' not in data:
            return jsonify({'error': 'Alert ID required'}), 400
        
        alert_id = data['alert_id']
        alert = active_emergencies.get(alert_id)
        
        if not alert:
            return jsonify({
                'success': False,
                'error': 'Emergency alert not found'
            }), 404
        
        # Simulate notification process
        emergency_type = alert['type']
        contact_number = EMERGENCY_CONTACTS.get(emergency_type, EMERGENCY_CONTACTS['general'])
        
        # Update alert with notification info
        alert['contacts_notified'].append({
            'contact': contact_number,
            'notified_at': datetime.now().isoformat(),
            'method': 'simulated_call'
        })
        
        logger.info(f"Emergency contacts notified for alert {alert_id}: {contact_number}")
        
        return jsonify({
            'success': True,
            'message': f'Emergency contacts notified: {contact_number}',
            'contact_number': contact_number,
            'notification_time': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error notifying emergency contacts: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500