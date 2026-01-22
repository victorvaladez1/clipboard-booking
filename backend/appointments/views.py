from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Barber, Service, Customer, Appointment, Notification
from .serializers import (
    BarberSerializer,
    ServiceSerializer,
    CustomerSerializer,
    AppointmentSerializer,
    NotificationSerializer
)

@api_view(["GET"])
def list_barbers(request):
    qs = Barber.objects.filter(active=True).order_by("name")
    return Response(BarberSerializer(qs, many=True).data)

@api_view(["GET"])
def list_services(request):
    qs = Service.objects.filter(active=True).order_by("name")
    return Response(ServiceSerializer(qs, many=True).data)

@api_view(["POST"])
def create_customer(request):
    ser = CustomerSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    customer = ser.save()
    return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
def create_appointment(request):
    """
    Expects:
    {
        "barber": 1,
        "service": 2,
        "customer": 3,
        "start_time": "2026-01-22T14:00:00Z",
        "end_time": "2026-01-22T14:30:00Z",
        "notes": ""
    }
    """

    ser = AppointmentSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    
    barber_id = ser.validated_data["barber"].id
    start = ser.validated_data["start_time"]
    end = ser.validated_data["end_time"]

    # overlap check: (existing.start < new_end) and (existing.end > new_start)
    overlap = Appointment.objects.filter(
        barber_id=barber_id,
        status=Appointment.Status.BOOKED,
    ).filter(
        Q(start_time__lt=end) & Q(end_time__gt=start)
    ).exists()

    if overlap:
        return Response(
            {"error": "This time slot overlaps an existing appointment."},
            status=status.HTTP_409_CONFLICT,
        )
    
    appt = ser.save(status=Appointment.Status.BOOKED)

    # create in-app notification
    Notification.objects.create(
        customer=appt.customer,
        message=f"Appointment booked for {appt.start_time}."
    )

    return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
def list_notifications(request):
    customer_id = request.query_params.get("customer_id")
    if not customer_id:
        return Response(
            {"error": "customer_id query param is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    unread_only = request.query_params.get("unread") == "true"
    qs = Notification.objects.filter(customer_id=customer_id).order_by("-created_at")
    if unread_only:
        qs =qs.filter(is_read=False)
    
    return Response(NotificationSerializer(qs, many=True).data)

@api_view(["POST"])
def mark_notification_read(request, notification_id: int):
    updated = Notification.objects.filter(id=notification_id).update(is_read=True)
    if updated == 0:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"ok": True})