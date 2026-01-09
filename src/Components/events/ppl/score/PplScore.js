import React from "react";
import {Container, Box} from "@mui/material";
import './pplscore.css';
import firstPlace from "../../../../images/Events/ppl/first.png";
import secondPlace from "../../../../images/Events/ppl/second.png";
import award from "../../../../images/Events/ppl/award.png";

function PplScore() {
    return (
        <>
            <div className='score-landing-container-div'>
                <Container className='score-landing-container'>
                    <div className='score-heading1'>போட்டி முடிவுகள்</div>
                    <Box className='score-container'>
                        <div className="score-column">
                            <div className="score-row">
                                <div className='ppl-score-icon-container'>
                                    <img src={firstPlace} alt="PPL First Place" className="score-icon" />
                                </div>
                                <div className='score-text'>Spicy Blasters</div>
                            </div>
                            <div className="score-row">
                                <div className='ppl-score-icon-container'>
                                    <img src={secondPlace} alt="PPL Second Place" className="score-icon" />
                                </div>
                                <div className='score-text'>Cheddi Nadu Supper King</div>
                            </div>
                        </div>
                        <div className='score-column'>
                            <div className='score-row score-row-center'>
                                <img src={award} alt="PPL Award" className="score-icon" />
                                <div className='score-text'>Logithan</div>
                            </div>
                        </div>
                    </Box>
                </Container>
            </div>
        </>
    )
}

export default PplScore;
