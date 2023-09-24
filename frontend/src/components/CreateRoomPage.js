import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel, Collapse, Alert } from '@mui/material';


function CreateRoomPage({ _votesToSkip = 2, _guestCanPause = true, _update = false, _roomCode = null, updateCallback = () => {} }) {

    //const defaultVotes = props.votesToSkip;
    const [guestCanPause, setGuestCanPause] = useState(_guestCanPause);
    const [votesToSkip, setVotesToSkip] = useState(_votesToSkip);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleVotesChange = e => {
        setVotesToSkip(e.target.value);
    }

    const handleGuestCanPauseChange = e => {
        setGuestCanPause(e.target.value === "true" ? 'true' : 'false');
    }

    const navigate = useNavigate();

    const handleRoomButtonPressed = () => {
        
        const requestOptions = {
            method : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause
            })
        };
        fetch("/api/create-room", requestOptions)
        .then((response) => response.json())
        .then((data) => navigate("/room/" + data.code));
    }

    const title = _update ? "Update Room" : "Create a Room";

    const renderCreateButtons = () => {
        return (
            <Grid container spacing = {1}>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={handleRoomButtonPressed}>Create a Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>Back</Button>
                </Grid>
            </Grid>
        )
    }    

    const handleUpdateButtonPressed = () => {
        const requestOptions = {
            method : "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
                code: _roomCode
            })
        };
        fetch("/api/update-room", requestOptions)
        .then((response) => {
            // is response OK
            if(response.ok) {
                setSuccessMessage("Room updated successfully!")
            } else {
                setErrorMessage("Error updating room")
            }
            updateCallback();
        });
        
    }

    const renderUpdateButtons = () => {
        return (
            <Grid container spacing = {1}>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={handleUpdateButtonPressed}>Update Room</Button>
                </Grid>
            </ Grid>
        )
    }

    return (

        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Collapse in={errorMessage != "" || successMessage != ""}>
                    {successMessage != "" ? (<Alert severity='success' onClose={() => {
                        setSuccessMessage("")
                    }}>{successMessage}</Alert>) : (<Alert severity='error' onClose={() => {
                        setErrorMessage("")
                    }}>{errorMessage}</Alert>)}
                </Collapse>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align='center'>
                            Control of Playback State
                        </div>
                    </FormHelperText>
                    <RadioGroup row defaultValue={_guestCanPause.toString()} onChange={handleGuestCanPauseChange}>
                        <FormControlLabel 
                            value="true" 
                            control={<Radio color="primary"/>}
                            label="Play/Pause"
                            labelPlacement="bottom"
                        />
                        <FormControlLabel 
                            value="false" 
                            control={<Radio color="secondary"/>}
                            label="No Control"
                            labelPlacement="bottom"
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField 
                        required={true} 
                        type="number" 
                        onChange={handleVotesChange}
                        defaultValue={votesToSkip} 
                        inputProps={{
                            min:1, 
                            style:{textAlign:"center"}
                        }}
                    />
                    <FormHelperText>
                        <div align="center">
                            Votes required to skip song
                        </div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {_update ? renderUpdateButtons() : renderCreateButtons()}
        </Grid>);
}
    
export default CreateRoomPage;   
    
