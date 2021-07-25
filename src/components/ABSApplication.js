import Footer from 'components/Footer'
import Header from "components/Header";
import Container from "components/Container"

export default function ABSApplication() {
    let headerContext = {
        updatePage: () => {}
    };
    return <>
        <Header context={headerContext}/>
        <Container header={headerContext}/>
        <Footer/>
    </>;
};


