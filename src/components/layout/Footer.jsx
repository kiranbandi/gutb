import React from 'react'
import { AppBar, Toolbar, Stack, Typography, Box, IconButton, Link, CardMedia, Card } from '@mui/material'
import labLogo from "data/usask_p2irc_colour.png"
import uniLogo from "data/usask_usask_colour.png"
import { teal } from '@mui/material/colors';




function Footer() {
    return (
        <>
            <footer>

                <AppBar
                    position='static'
                    sx={{
                        bottom: 0,
                        mt: '100px',
                        backgroundColor: 'transparent',
                        borderTop: '2px solid ' + teal[800],
                        boxShadow: 'none'
                    }} >
                    <Toolbar sx={{
                        justifyContent: 'space-between',
                    }}>
                        <Typography
                            variant="subtitle2"
                            component='p'
                            sx={{
                                ml: 2,
                                mr: 30,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 500,
                                color: 'gray',
                                textDecoration: 'none',
                                WebkitUserSelect: 'none',

                            }}>
                            Developed by the HCI Lab at the University of Saskatchewan
                        </Typography>
                        <IconButton sx={{
                            borderRadius: 3,
                            m: 0,
                            '&:hover': {
                                backgroundColor: teal[50]
                            }
                        }}>
                            <Link
                                href="https://hci.usask.ca/index.php/recruitment/"
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    color: 'inherit',
                                }}>
                                <img
                                    src={labLogo}
                                    height="60px" />
                            </Link>
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </footer>
        </>
    )
}

export default Footer