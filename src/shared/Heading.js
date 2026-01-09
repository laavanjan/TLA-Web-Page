import Box from '@mui/material/Box'
import './style.css'

const Heading = ({ children }) => {
    return (
        <Box sx={{ py: 4 }} display="flex" justifyContent="space-around" alignItems="center">
            <div className="heading">{children}</div>
        </Box>
    );
}

export default Heading;