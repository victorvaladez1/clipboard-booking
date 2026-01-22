from django.urls import path
from . import views

urlpatterns = [
    path("barbers/", views.list_barbers),
    path("services/", views.list_services),
    path("customers/", views.create_customer),
    path("appointments/", views.create_appointment),
    path("notifications/", views.list_notifications),
    path("notifications/<int:notification_id>/read/", views.mark_notification_read),
]