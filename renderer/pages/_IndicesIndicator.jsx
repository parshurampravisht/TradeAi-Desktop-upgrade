import { Container, Row } from '@nextui-org/react'
import Indicators from '../component/dashboard/indicators'

function IndicesIndicator({ children }) {

    return (
        <Container
            fluid
            css={{
                maxWidth: "100%",
                overflow: "hidden",
                background: "#E9E9E9 ",
                height: "calc(100vh - 53px)",
                position: "relative",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <div className='width-100'>
                    <Row justify="space-between" className='flex-row width-100'>
                        <Indicators />
                    </Row>
                </div>
            </div>
            {children}
        </Container>
    )
}

export default IndicesIndicator