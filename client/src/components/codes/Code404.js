import {Link} from "react-router-dom";

export default function Code404() {
    return <div className={'httpcode'}>
        <div className="card httpcode__card">
            <div className="card-content">
                <p className="title">
                    404
                </p>
                <p className="subtitle">
                    Not found
                </p>
            </div>
            <Link to={"/"} className="card-footer httpcode__card__link">
                <p className="card-footer-item">
                  <span>
                    Main page
                  </span>
                </p>
            </Link>
        </div>
    </div>
}