from django.contrib import admin
from django.http import HttpResponse
from .models import User
import os

@admin.action(description="Eksportuj wybrane hashe do pliku .txt")
def export_hashes(modeladmin, request, queryset):
    download_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)

    filename = os.path.join(download_dir, "exported_hashes.txt")

    with open(filename, "w") as file:
        for user in queryset:
            file.write(f"{user.username}\n{user.password_hash}\n")

    with open(filename, "r") as file:
        response = HttpResponse(file.read(), content_type="text/plain")
        response["Content-Disposition"] = f'attachment; filename="{os.path.basename(filename)}"'
        return response

class UserAdmin(admin.ModelAdmin):
    list_display = ('id','username', 'hash_method', 'password_hash', 'last_login')
    actions = [export_hashes]

admin.site.register(User, UserAdmin)
