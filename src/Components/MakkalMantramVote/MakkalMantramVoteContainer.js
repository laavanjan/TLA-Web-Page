import React, { useEffect, useState } from "react";
import "./MakkalMantramVoteContainer.css";
import MakkalMantramIcon from "./MakkalMantramVote.svg";
import ThumbUp from "./ThumbUp.svg";
import ThumbDown from "./ThumbDown.svg";
import axios from "axios";
import BarChart from "./BarChart";
import AutorenewIcon from "@material-ui/icons/Autorenew";
const MakkalMantramVoteContainer = ({ showChart }) => {
  const [questionData, setQuestionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState({});
  const [triggerLoad, setTriggerLoad] = useState();
  useEffect(() => {
    if (localStorage.getItem("mmvs")) {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }
  }, []);

  const extractChartData = (questionData) => {
    const answerValues = [];
    const counts = [];
    questionData.results.forEach((result) => {
      const answer = questionData.answers.find(
        (answer) => answer._id === result.answerId
      );
      if (answer) {
        answerValues.push(answer.value);
        counts.push(result.count);
      }
    });
    return { answerValues, counts };
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/makkal-mantram/questions")
      .then((res) => {
        setLoading(false);
        setQuestionData(res.data);
        if (res.data.status === "3") {
          const { answerValues, counts } = extractChartData(res.data);
          console.log(answerValues, counts);
          setResults({
            answerValues: answerValues,
            counts: counts,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [triggerLoad]);

  const submitAnswer = (answerid) => {
    if (answerid === null) {
      alert("Null Value Received !");
    } else {
      try {
        axios
          .post("/api/makkal-mantram/addvote", {
            questionid: questionData._id,
            answerid: answerid,
          })
          .then((res) => {
            setIsSubmitted(true);
            localStorage.setItem("mmvs", "true");
          })
          .catch((error) => {
            if (error.response && error.response.status === 429) {
              alert("மன்னிக்கவும், நீங்கள் ஏற்கனவே வாக்களித்துள்ளீர்கள்!");
            } else {
              alert("மன்னிக்கவும், உங்கள் வாக்கை பதிவு செய்ய முடியவில்லை !");
            }
          });
      } catch (error) {
        alert("மன்னிக்கவும், உங்கள் வாக்கை பதிவு செய்ய முடியவில்லை !");
      }
    }
  };

  return (
    <div className="mmvc-main-container">
      <div className="mmvc-container">
        <div className="mmvc-heading">மக்கள் மன்றம்</div>
        {showChart ? null : (
          <img
            src={MakkalMantramIcon}
            className="mmvc-image"
            alt="icon"
            loading="lazy"
          />
        )}

        <div className="mmvc-question">{questionData.question}</div>

        {/*  */}
        <div className="mmvc-response">
          {/* Status 1 - ToBe Opened */}
          {questionData.status === "1" && (
            <div className="mmvc-tobe">
              வாக்களிப்பு இன்னும் ஆரம்பிக்கவில்லை
              <AutorenewIcon
                onClick={() => {
                  setTriggerLoad(Date.now);
                }}
                className={loading ? "refresh-icon-load" : ""}
              />
            </div>
          )}
          {/* Status 2 - Opened */}

          {questionData.status === "2" ? (
            <div className="mmvc-opened">
              {isSubmitted ? (
                <div>
                  <div className="mmvc-vote-done">
                    உங்கள் வாக்கு பதிவுசெய்யப்பட்டது
                  </div>
                  {showChart ? (
                    <div className="mmvc-result-view">
                      மக்கள் தீர்ப்பினை பார்வையிட{" "}
                      <AutorenewIcon
                        onClick={() => {
                          setTriggerLoad(Date.now);
                        }}
                        className={loading ? "refresh-icon-load" : ""}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <button
                    className="mmvc-button"
                    onClick={() => {
                      submitAnswer(
                        Array.isArray(questionData.answers)
                          ? questionData.answers[0]._id
                          : null
                      );
                    }}
                  >
                    <img src={ThumbUp} alt="yes" />
                    {Array.isArray(questionData.answers)
                      ? questionData.answers[0].value
                      : ""}
                  </button>
                  <button
                    className="mmvc-button"
                    onClick={() => {
                      submitAnswer(
                        Array.isArray(questionData.answers)
                          ? questionData.answers[1]._id
                          : null
                      );
                    }}
                  >
                    <img src={ThumbDown} alt="yes" />
                    {Array.isArray(questionData.answers)
                      ? questionData.answers[1].value
                      : ""}
                  </button>
                </>
              )}
            </div>
          ) : null}
          {/* if question is closed*/}
          {questionData.status === "3" && showChart !== true && (
            <div className="mmvc-vote-done">வாக்களிப்பு நிறைவடைந்தது</div>
          )}
          {/* Status 3: Closed */}
          {showChart && questionData.status === "3" ? (
            <div className="mmvc-closed">
              <BarChart
                answerValues={results.answerValues || []}
                counts={results.counts || []}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MakkalMantramVoteContainer;
