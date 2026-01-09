import React from 'react'
import "./RulesButton.css"
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
// import { rules } from './rules';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

};


function RulesButton() {
  // write expanded rules displaying method here.
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [rules, setRules] = useState([]);

  useEffect(() => {
      const fetchEvents = async () => {
          try {
              const response = await fetch('/api/ideathon-rules');

              if (!response.ok) {
                  throw new Error('Failed to fetch events');
              }

              const data = await response.json();
              setRules(data);
          } catch (error) {
              console.error('Error fetching events:', error);
          }
      };
      fetchEvents();
    }, []);

  return (
    <div className='btnContainer'>
      <div className="rulesBtn" onClick={() => handleOpen()}> போட்டி விதிமுறைகள்</div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='boxStyle'>
          <Typography id="modal-modal-title" className='boxHeading'>
            போட்டி விதிமுறைகள்
          </Typography>
          <Typography id="modal-modal-description" >
            {rules.map((rules, index) => (
              <ul key={index}>
                <li className='listItem'>{rules.description}</li>
              </ul>
            ))}

          </Typography>
        </Box>
      </Modal>
    </div>
  )
}

export default RulesButton