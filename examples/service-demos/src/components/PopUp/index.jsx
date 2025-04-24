import { useEffect, useRef } from "react";
import "./styles.css";

const PopUp = ({ children, isPopupView, closePopUp, position = "right" }) => {
    const popupRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                closePopUp()
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupRef]);

    if (!isPopupView) {
        return null
    }

    return (
        <div ref={popupRef} className={`popup ${position}`}>
            { children }
        </div>
    )
}

export default PopUp;