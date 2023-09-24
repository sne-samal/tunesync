import React, { Component, useEffect, useState } from 'react';
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter as Router, Routes, Route, Link, Redirect, Navigate } from "react-router-dom";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from '@mui/material';


function HomePage () {
    const [roomCode, setRoomCode] = useState(null);

    useEffect(() => {
        fetch('/api/user-in-room').then((response) => response.json()).then((data) => {
            setRoomCode(data.code)
        });
    })


    const renderHomePage = () => {
        return(
            <Grid container spacing = {3}>
                <Grid item xs={12} align="center">
                    <Typography variant = "h3" component = "h3">
                        Tunesync
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to='/join' component={ Link }>
                            Join a Room
                        </Button>
                        <Button color="secondary" to='/create' component={ Link }>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    const clearRoomCode = () => {
        setRoomCode(null);
    }

    return (
        <Router>
            <Routes>
                <Route path='/join' element={<RoomJoinPage />}/>
                <Route path='/create' element={<CreateRoomPage />}/>
                
                <Route exact path = "/" element ={
                    roomCode ? (<Navigate to={`/room/${roomCode}`} />) : (renderHomePage())
                } />
                <Route path='/room/:roomCode' element={<Room leaveRoomCallback={clearRoomCode}/>} />
            </Routes>
        </Router>
    );

}

export default HomePage;