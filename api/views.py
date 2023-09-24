from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


# Create your views here.

# write an API view that will let us view a list of all the available rooms

class RoomView(generics.ListAPIView):
    # allows use to create a room and view all the rooms
    queryset = Room.objects.all() # what we want to return 
    serializer_class = RoomSerializer # converts to a format that can actually be returned

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        # get the code from url
        code = request.GET.get(self.lookup_url_kwarg) # gets info from the url from the get request
        if code != None:
            room = Room.objects.filter(code=code) # grabt the room code from the database
            if len(room) > 0:
                data = RoomSerializer(room[0]).data #serializing the one room and taking the data and extracting it
                data['is_host'] = self.request.session.session_key == room[0].host # the host is the session key of the room
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)




class JoinRoom(APIView):

    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        # does the user have an active session?
        if not self.request.session.exists(self.request.session.session_key): # has the current user got an active session with the web page
            self.request.session.create() # create one
        
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) >  0:
                room = room_result[0]
                # make a note on the backend to show that this user is in this room
                self.request.session['room_code'] = code
                return Response({'message' : 'Room Joined!'}, status=status.HTTP_200_OK)
            
            return Response({'Bad Request' : 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'Bad request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)
            





class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): # has the current user got an active session with the web page
            self.request.session.create() # create one
        
        serializer = self.serializer_class(data=request.data) #take all the data and serialise it and give a python representation of it so we can check if the data is valid
        if serializer.is_valid(): # are the data fields in the post request valid?
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            # if the host already has an active room then, we update the current active room settings with the info in the post request
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip']) #pass any fields that I want to update
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
            else: # we are creating a room
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
            #we still need to return a response to determine whether creating the room was valid or not
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED) #send them back the exact room they have created with the information about the room - id, created at etc - done with the room serialiser
        
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)




class UserInRoom(APIView):
    
    # send a get request to endpoint and check if the current user is in the room of their current session
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): # has the current user got an active session with the web page
            self.request.session.create() # create one
        data = {
            'code' : self.request.session.get('room_code') # get info from the session
        }
        return JsonResponse(data, status=status.HTTP_200_OK)



class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code') # check if the user is the host of the room, if they are then delete that room
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message' : 'Success'}, status=status.HTTP_200_OK)
    


# update a room - need to know the room code and the info that needs to be updated
class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    def patch(self, request, format=None): # patch is like updating - modifying something on the server. Post is for creating something new on the server
        if not self.request.session.exists(self.request.session.session_key): # has the current user got an active session with the web page
            self.request.session.create() # create one

        serializer = self.serializer_class(data=request.data) #pass in data to the serializer to check if it is valid
        if serializer.is_valid():
            #grab some info from the serializer
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            #find the room with the matching code
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not Found'}, status=status.HTTP_404_NOT_FOUND)
            
            # valid room has been found
            room = queryset[0]

            # check if the person trying to update the room is the owner of the room
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room'}, status=status.HTTP_403_FORBIDDEN)


            # go ahead and update the room
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request' : 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST )