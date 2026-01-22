from rest_framework import serializers
from .models import Barber, Service, Customer, Appointment, Notification

class BarberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barber
        fields = ["id", "name", "active"]

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "duration_minutes", "price_cents", "active"]

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "name", "phone"]

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id",
            "barber",
            "service",
            "customer",
            "start_time",
            "end_time",
            "status",
            "notes",
            "created_at"
        ]

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "customer", "message", "is_read", "created_at"]