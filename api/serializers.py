# takes the python model code and translates it to a JSON response
# helpful for creating an API view

from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at') # matches field name, automatically an id field in a model

class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip') #serialize a request and give it to us in a python format

class UpdateRoomSerializer(serializers.ModelSerializer):

    code = serializers.CharField(validators=[]) # redefined the code field in the serializer, not referenced in the models - allows to pass in a code that isn't unique, would return invalid if otherwise as we need to use the passed in code

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')