import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "./teams.css";
import { TeamsData } from "./teamsData";
import {
    fetchTeamJoinConfig,
    getCachedTeamJoinConfig,
} from "../../shared/teamJoinConfig";

const Teams = () => {
    const [joinCfg, setJoinCfg] = useState(getCachedTeamJoinConfig);

    useEffect(() => {
        let alive = true;
        fetchTeamJoinConfig()
            .then((c) => {
                if (alive) setJoinCfg(c);
            })
            .catch(() => {});
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="teams">
            <h1>அணிகள்</h1>
            <p className="intro">
            தமிழ் இலக்கிய மன்றத்தினால் வருடந்தோறும் தமக்கேயான தனியான பாணியில் தமிழருவி, சொற்கணை, பொங்கல் விழா, வாணி விழா, ஜீவநதி, துடுப்பாட்ட சுற்றுப்போட்டிகள் என எமது பல்கலைக்கழக மாணவர்கள் மட்டுமன்றி ஏனைய பல்கலைக்கழக மாணவர்கள், பாடசாலை மாணவர்கள் மட்டுமன்றி உலகெங்கும் பரந்து வாழும் தமிழ் மக்களின் திறன் விருத்திக்கும் ஆளுமை வளர்ச்சிக்கும் ஏற்பாடு செய்யப்பட்டு வருகின்றது. இந்த அனைத்து நிகழ்வுகளிற்கான ஏற்பாடுகள் ஆரம்பம் முதல் இறுதி வரை செவ்வனே புதிய படைப்புகளாகவும் தொழில்நுட்ப வளர்ச்சியின் அத்தியாயமாகவும் அமைய வடிவமைக்க வழிகோலும் வகையில் முதுகென்பாக இருக்கின்றார்கள் நம் வலையமைப்பு அணி, ஊடக அணி, வடிவமைப்பு அணி, தொழில்நுட்ப அணி.
            </p>

            {joinCfg.enabled && (
                <Link to="/teams/join" className="teams-join-banner">
                    <div>
                        <p className="teams-join-title">எங்கள் அணியில் இணையுங்கள்</p>
                        <p className="teams-join-text">
                            புதிய உறுப்பினர்களை நாங்கள் வரவேற்கிறோம் இப்போதே விண்ணப்பிக்கவும்.
                        </p>
                    </div>
                    <span className="teams-join-cta">
                        விண்ணப்பிக்க <FaArrowRight />
                    </span>
                </Link>
            )}

            {TeamsData.map((teamsData) => {
                return (
                    <Link
                        to={`/teams/${teamsData.id}`}
                        key={teamsData.id}
                        className="teams-card"
                    >
                        <p className="teams-card-title">{teamsData.title}</p>
                        <p className="teams-card-description">{teamsData.description}</p>
                        <span className="teams-card-more">
                            மேலும் அறிய <FaArrowRight />
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default Teams;
