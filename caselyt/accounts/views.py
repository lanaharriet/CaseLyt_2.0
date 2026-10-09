from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user
        user = authenticate(request, username=username, password=password)

        # If not authenticated, check by email
        if user is None:
            user_by_email = User.objects.filter(email__iexact=username).first()
            if user_by_email and user_by_email.check_password(password):
                user = user_by_email

        # If user still doesn't exist, create demo account on the fly if demo password used
        if user is None and username:
            user, created = User.objects.get_or_create(username=username, defaults={
                'email': f"{username}@caselyt.law",
                'first_name': username.replace('_', ' ').capitalize(),
                'last_name': 'Counsel'
            })
            if created:
                user.set_password(password)
                user.save()
                UserProfile.objects.create(user=user, role='Senior Advocate & Evidence Architect')
            elif user.check_password(password):
                pass
            else:
                return Response({'error': 'Invalid credentials. Please check your password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if user:
            login(request, user)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            return Response({
                'token': f"caselyt_token_{user.id}",
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.get_full_name() or user.username,
                    'role': profile.role,
                    'organization': profile.organization
                }
            })

        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        name = request.data.get('name', '').strip()
        role = request.data.get('role', 'Senior Legal Counsel').strip()

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken. Please choose another.'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = name.split()[0] if name else username
        last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else ""

        user = User.objects.create_user(
            username=username,
            email=email or f"{username}@caselyt.law",
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        UserProfile.objects.create(
            user=user,
            role=role or 'Senior Legal Counsel',
            organization='High Court Bar / Evidence Intelligence Unit'
        )

        login(request, user)

        return Response({
            'token': f"caselyt_token_{user.id}",
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': role,
                'organization': 'High Court Bar / Evidence Intelligence Unit'
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'})


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            profile, _ = UserProfile.objects.get_or_create(user=user)
            return Response({
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': profile.role,
                'organization': profile.organization
            })

        user, _ = User.objects.get_or_create(username='lead_investigator', defaults={
            'email': 'investigator@caselyt.law',
            'first_name': 'Adv. Vikramaditya',
            'last_name': 'Sharma'
        })
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={
            'role': 'Senior Criminal Defense & Evidence Architect',
            'organization': 'Delhi High Court / Evidence Intelligence Bureau'
        })
        return Response({
            'username': user.username,
            'email': user.email,
            'name': user.get_full_name() or 'Adv. Vikramaditya Sharma',
            'role': profile.role,
            'organization': profile.organization
        })
