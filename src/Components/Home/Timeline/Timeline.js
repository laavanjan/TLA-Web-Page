import Container from '@mui/material/Container'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import Heading from '../../../shared/Heading';
import TimelineItem from './TimelineItem';

import events from './events';
import 'react-vertical-timeline-component/style.min.css';
import './style.css'

const Timeline = () => {
    return (
        <div className="timeline-container-div" id="timeline">
            <Container maxWidth='lg' sx={{ py: 1 }}>
                <Heading>நிகழ்வுகள்</Heading>
                <VerticalTimeline
                    lineColor='#022345'
                >
                    {events.map((event, id) => (
                        <TimelineItem
                            key={id}
                            title={event.title}
                            date={event.date}
                            content={event.descriiption}
                            active={event.active}
                            link={event.link}
                        />
                    ))}

                    <VerticalTimelineElement
                        iconStyle={{ background: '#DFE3E9', color: '#fff' }}
                    // icon={<StarIcon />}
                    />
                </VerticalTimeline>
            </Container>
        </div>
    );
}

export default Timeline;