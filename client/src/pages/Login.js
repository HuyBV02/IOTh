import React, { useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function Login({ setToken }) {
    const navigate = useNavigate();
    // const [login, setlogin] = useState('');
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    const handleSubmit = async (event) => {
        // const data = new FormData(event.currentTarget);
        event.preventDefault();

        const response = await axios.post(
            'http://localhost:8888/api/user/login',
            {
                email: username,
                password: password,
            },
        );

        setToken(response.data.accessToken)

        // console.log(response.data.userData);

        if (response.data.sucess) {
            window.localStorage.setItem(
                'accessToken',
                JSON.stringify(response.data.accessToken),
            );
            window.localStorage.setItem(
                'userData',
                JSON.stringify(response.data.userData),
            );

            navigate('/dashboard', { replace: true });
        } else {
            alert('Error');
            navigate('/login', { replace: true });
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '16px',
                        boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.5)',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="remember"
                                    color="primary"
                                    // onChange={handleButtonClick}
                                />
                            }
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};
