import './App.css'
import { useState, useEffect, useRef, useCallback } from "react";

function App() {
  const [operation, setOperation] = useState("");
  const [bottom, setBottom] = useState("");
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("calcHistory");
    return stored ? JSON.parse(stored) : [];
  });
  const [histCon, setHistCon] = useState(false);
  const [numLock, setNumLock] = useState(false);
  const [isVisible, setIsVisible] = useState(window.innerWidth <= 750);

    

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth <= 750);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }, [history]);

  const handleDigit = useCallback((value) => {
    if (bottom === "" && value === "0" || bottom === "" && value === "00") {
      console.log("Ignored leading 0.");
      return;
    }
    if (bottom === "" && value === ".") {
      setBottom("0.");
      console.log("Digit clicked: '.', New bottom: 0.");
      return;
    }
    const newBottom = bottom + value;
    setBottom(newBottom);
    console.log("Digit clicked:", value, "New bottom:", newBottom);
  }, [bottom]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (bottom.length !== 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [bottom]);


  const handleOperatorClick = useCallback((token) => {
    let newOperation = operation;
    if (token === "(") {
      if (bottom !== "") {
        newOperation += bottom + "*(";
        console.log("Inserted '*' before '(' from bottom.");
      } else if (operation !== "" && /[0-9)]$/.test(operation)) {
        newOperation += "*" + token;
      } else {
        newOperation += token;
      }
    } else {
      if (bottom !== "") {
        newOperation += bottom;
      }
      newOperation += token;
    }
    setOperation(newOperation);
    setBottom("");
    console.log("Operator/Token clicked:", token, "New operation:", newOperation);
  }, [operation, bottom]);

  const handleEquals = useCallback(() => {
    let newOperation = operation;
    if (bottom !== "") {
      newOperation += bottom;
    }
    console.log("Evaluating operation:", newOperation);
    try {
      const expression = newOperation.replace(/\^/g, "**");
      const result = eval(expression);
      console.log("Result:", result);
      if (newOperation) {
        const newEntry = {
          operation: newOperation + "=",
          answer: result.toString(),
        };
        setHistory((prev) => [...prev, newEntry]);
      }
      setOperation(newOperation + "=");
      setBottom(result.toString());
    } catch (error) {
      console.log("Evaluation error:", error);
      setBottom("Error");
    }
  }, [operation, bottom]);

  const handleBackspace = useCallback(() => {
    if (bottom !== "") {
      const newBottom = bottom.slice(0, -1);
      setBottom(newBottom);
      console.log("Backspace in bottom, new bottom:", newBottom);
    } else if (operation !== "") {
      const newOperation = operation.slice(0, -1);
      setOperation(newOperation);
      console.log("Backspace in operation, new operation:", newOperation);
    }
  }, [bottom, operation]);

  const handleClear = () => {
    if (operation !== "" || bottom !== "") {
      const newEntry = {
        operation: operation,
        answer: bottom,
      };
      setHistory((prev) => [...prev, newEntry]);
    }
    setOperation("");
    setBottom("");
    console.log("Clear pressed. Calculation saved to history.");
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("calcHistory");
    console.log("History cleared.");
  };

  const handleToggleSign = () => {
    if (bottom !== "") {
      const toggled = bottom.startsWith("-") ? bottom.substring(1) : "-" + bottom;
      setBottom(toggled);
      console.log("Toggle sign, new bottom:", toggled);
    }
  };

  const handlePercent = () => {
    if (bottom !== "") {
      const num = parseFloat(bottom);
      const percentValue = (num / 100).toString();
      setBottom(percentValue);
      console.log("Percent clicked, new bottom:", percentValue);
    }
  };

  const handleFunction = (fn) => {
    if (bottom !== "") {
      const newBottom = `${fn}(${bottom})`;
      setBottom(newBottom);
      console.log(`${fn} applied, new bottom:`, newBottom);
    } else {
      const newOperation = operation + fn + "(";
      setOperation(newOperation);
      console.log(`${fn} applied, new operation:`, newOperation);
    }
  };

  const toggleHistCon = () => {
    setHistCon((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!numLock) return;

      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === ".") {
        handleDigit(".");
      } else if (["+", "-", "*", "/", "(", ")", "^"].includes(e.key)) {
        handleOperatorClick(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        handleEquals();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numLock, handleDigit, handleOperatorClick, handleBackspace, handleEquals]);

  const handleCheckboxChange = (e) => {
    setNumLock(e.target.checked);
  };



  const cardWrapperRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const cardWrapper = cardWrapperRef.current;
    const card = cardRef.current;

    if (!cardWrapper || !card) return;

    const handleMouseMove = (e) => {
      let rect = cardWrapper.getBoundingClientRect();
      let x = e.clientX - rect.left - rect.width / 2;
      let y = e.clientY - rect.top - rect.height / 2;

      card.style.transform = `rotateX(${-y / -50}deg) rotateY(${x / -50}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    cardWrapper.addEventListener("mousemove", handleMouseMove);
    cardWrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cardWrapper.removeEventListener("mousemove", handleMouseMove);
      cardWrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="whole" ref={cardWrapperRef}>
      <div className="container" ref={cardRef}>

        <div className="titleTop">
          <p aria-label="Scientific Calculator">Scientific Calculator</p>
          <i onClick={toggleHistCon} className="fa-solid fa-bars"></i>
        </div>


        <div className="inputsDisplays">
          <input aria-label="Display Operations" type="text" value={operation} readOnly placeholder="" />
          <input aria-label="Display Numbers" type="text" value={bottom} readOnly placeholder="0" />
        </div>


        <div className="enableCon">
          <label className="label">
              <div className="toggle">
                  <input
                    className="toggle-state"
                    type="checkbox"
                    name="check"
                    value="check"
                    onChange={handleCheckboxChange}
                  />
                  <div className="indicator"></div>
              </div>
          </label>
          <p>Num Lock {numLock ? "Enabled" : "Disabled"}</p>
        </div>


        <div className="keyCon">
          <button
            aria-label="Button Toggle Positive or Negative Sign"
            className="btn25"
            onClick={handleToggleSign}
          >
            +/-
          </button>
          <button
            aria-label="Button Clear All"
            className="clear"
            onClick={handleClear}
          >
            C
          </button>
          <button
            aria-label="Button Backspace"
            className="backspace"
            onClick={handleBackspace}
          >
            <i className="fa-solid fa-delete-left"></i>
          </button>
          <button
            aria-label="Button Sine"
            className="btn18"
            onClick={() => handleFunction("sin")}
          >
            sin
          </button>
          <button
            aria-label="Button Open Parenthesis"
            className="btn21"
            onClick={() => handleOperatorClick("(")}
          >
            (
          </button>
          <button
            aria-label="Button Close Parenthesis"
            className="btn22"
            onClick={() => handleOperatorClick(")")}
          >
            )
          </button>
          <button
            aria-label="Button Percent"
            className="btn23"
            onClick={handlePercent}
          >
            %
          </button>
          <button
            aria-label="Button Division"
            className="btn4 operators"
            onClick={() => handleOperatorClick("/")}
          >
            /
          </button>
          <button
            aria-label="Button Cosine"
            className="btn19"
            onClick={() => handleFunction("cos")}
          >
            cos
          </button>
          <button
            aria-label="Button 7"
            className="btn1 btnDigit"
            onClick={(e) => handleDigit("7", e)}
          >
            7
          </button>
          <button
            aria-label="Button 8"
            className="btn2 btnDigit"
            onClick={(e) => handleDigit("8", e)}
          >
            8
          </button>
          <button
            aria-label="Button 9"
            className="btn3 btnDigit"
            onClick={(e) => handleDigit("9", e)}
          >
            9
          </button>
          <button
            aria-label="Button Multiplication"
            className="btn8 operators"
            onClick={() => handleOperatorClick("*")}
          >
            *
          </button>
          <button
            aria-label="Button Tangent"
            className="btn20"
            onClick={() => handleFunction("tan")}
          >
            tan
          </button>
          <button
            aria-label="Button 4"
            className="btn5 btnDigit"
            onClick={(e) => handleDigit("4", e)}
          >
            4
          </button>
          <button
            aria-label="Button 5"
            className="btn6 btnDigit"
            onClick={(e) => handleDigit("5", e)}
          >
            5
          </button>
          <button
            aria-label="Button 6"
            className="btn7 btnDigit"
            onClick={(e) => handleDigit("6", e)}
          >
            6
          </button>
          <button
            aria-label="Button Subtraction"
            className="btn12 operators"
            onClick={() => handleOperatorClick("-")}
          >
            -
          </button>
          <button
            aria-label="Button Exponent"
            className="btn24"
            onClick={() => handleOperatorClick("^")}
          >
            ^
          </button>
          <button
            aria-label="Button 1"
            className="btn9 btnDigit"
            onClick={(e) => handleDigit("1", e)}
          >
            1
          </button>
          <button
            aria-label="Button 2"
            className="btn10 btnDigit"
            onClick={(e) => handleDigit("2", e)}
          >
            2
          </button>
          <button
            aria-label="Button 3"
            className="btn11 btnDigit"
            onClick={(e) => handleDigit("3", e)}
          >
            3
          </button>
          <button
            aria-label="Button Addition"
            className="btn16 operators"
            onClick={() => handleOperatorClick("+")}
          >
            +
          </button>
          <button
            aria-label="Button Double Zero"
            className="btn27"
            onClick={() => handleDigit("00")}
          >
            00
          </button>
          <button
            aria-label="Button 0"
            className="zero btnDigit"
            onClick={() => handleDigit("0")}
          >
            0
          </button>
          <button
            aria-label="Button Decimal"
            className="btn14 btnDigit"
            onClick={() => handleDigit(".")}
          >
            .
          </button>
          <button
            aria-label="Button Equals"
            className="btn15 operators"
            onClick={handleEquals}
          >
            =
          </button>
        </div>
      </div>
      <div
        className="historyCon"
        id="historyCon"
        style={{
          width: histCon ? isVisible ? "100%" : "25rem" : "0",
          padding: histCon ? "1.5rem 2rem" : "1.5rem 0",
          paddingRight: histCon ? "1rem": "0rem"
          // display: histCon ? "flex" : "none"
        }}
      >
        <div className="titleTop">
          <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
            <span 
            onClick={toggleHistCon}
            style={{ display: isVisible ? "flex" : "none" }}>
              X</span>
            <p>History</p>
          </div>
          <p onClick={handleClearHistory}>Clear All</p>
        </div>
        <div className="wrapHistCon">
          {history.map((entry, index) => (
            <div className="histCard" key={index}>
              <p className="displayOperationHistory">{entry.operation}</p>
              <p className="displayAnswerHistory">{entry.answer}</p>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default App;
