import SnetSvgLogo from "../../assets/images/Logo_Header_Black.svg";
import "./styles.css";

const Header = () => {
    return (
        <header className="header">
            <img src={SnetSvgLogo} alt="SingularityNET" loading="lazy" />
            <h1 className="title">SNET SDK WEB EXAMPLE</h1>
        </header>
    )
}

export default Header;