import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

import './viewImage.css'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ViewImage({ open, handleClose, src }) {

    return (
        <div className='view-img-cont'>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                disableScrollLock
            >
                <Box sx={{ height: '100vh' }}>
                    <AppBar sx={{ position: 'relative', bgcolor: '#08315b', height: 54 }}>
                        <Toolbar sx={{ minHeight: '100% !important' }}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Heading' }} variant="h6" component="div">
                                புகைப்படம்
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Box sx={{ height: 'calc(100vh - 54px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box component={'img'} sx={{ maxHeight: '100%', maxWidth: '100%' }} src={src} />
                    </Box>
                </Box>
            </Dialog>
        </div>
    );
}