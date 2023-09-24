import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Button, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';


function Room(props) {
    const [votesToSkip, setVotesToSkip] = useState(3);
    const [guestCanPause, setGuestCanPause]  = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const [song, setSong] = useState({});

    const params = useParams();
    const roomCode = params.roomCode;
    
    const authenticateSpotify = () => {
        
        fetch('/spotify/is-authenticated').then((response) => response.json()).then((data) => {
            setSpotifyAuthenticated(data.status);
            if (!data.status) {
                fetch('/spotify/get-auth-url').then((response) => response.json()).then((data) => {
                    window.location.replace(data.url); // redirect to the spotify authorisation page 
                })
            }
        })
        
        
    }
        // send the request
        
    

    const getRoomdetails = () => {
        fetch('/api/get-room' + '?code=' + roomCode).then((response) => {
            if(!response.ok) {
                props.leaveRoomCallback();
                navigate("/");
            }
            //console.log("test");
            return response.json()
            })
            .then((data) => {
            setVotesToSkip(data.votes_to_skip);
            //console.log("test1");
            setGuestCanPause(data.guest_can_pause);
            setIsHost(data.is_host);
            if (isHost){
                authenticateSpotify();
            }
        });
    }

    const navigate = useNavigate();

    const leaveButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        }
        fetch('/api/leave-room', requestOptions).then((_response) => {
            props.leaveRoomCallback();
            navigate("/");
        })
    }

    const updateShowSettings = (value) => {
        setShowSettings(value)
    }

    const renderSettingsButton = () => {
        // only need to show the settings button if the user is a host
        // better than hard coding it
        return(
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        );
    }

    const renderSettings = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage _update={true} _votesToSkip={votesToSkip} _guestCanPause={guestCanPause} _roomCode={roomCode} updateCallBack={getRoomdetails} />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={() => updateShowSettings(false)}>
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    }

    
    const getCurrentSong = () => {
        fetch('/spotify/current-song')
            .then((response) => {
                if (!response.ok) {
                    return {};
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                setSong(data);
                console.log(data);
            });
    };
    
    getRoomdetails();
    useEffect(() => {
        //getCurrentSong();
        const interval = setInterval(() => {
            getCurrentSong(); 
            //console.log("test");
        }, 1000);
    
        return () => clearInterval(interval);
    }, []);


    {if (showSettings) {
        return renderSettings();
    }}
    return (
        <Grid container spacing ={1}>
            <Grid item xs={12} align="center">
                <Typography variant = "h4" component = "h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <MusicPlayer {...song}/>
            {isHost ? renderSettingsButton() : null}
            <Grid item xs={12} align="center">
                <Button variant = "contained" color="secondary" onClick= { leaveButtonPressed }>
                Leave Room
                </Button>
            </Grid>
        </Grid>  
    );
    


}

export default Room;