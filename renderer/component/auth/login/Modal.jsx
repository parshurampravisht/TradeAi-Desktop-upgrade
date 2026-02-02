import { Button, Checkbox, Modal, Spacer, Text } from "@nextui-org/react";
import { session } from "electron";
import { useRouter } from "next/router";
import { useState } from "react";

const licenseAgreement = [
  {
    header: `1. Purpose of the Software:-`,
    item: `The Software is a technology platform designed solely to facilitate trading in the Indian stock
markets using broker APIs. It is intended to provide convenience and efficiency to Users and does
not constitute financial or investment advice.`,
  },
  {
    header: `2. Non-Advisory Role:-`,
    item: `The Company is neither a registered investment advisor (RIA) nor a research analyst (RA) and does
not offer stock tips, recommendations, or investment advisory services.`,
  },
  {
    header: `3. User Responsibility and Risk Acknowledgment:-`,
    item: `Trading in the stock markets carries significant risks, including the potential for substantial losses.
The User acknowledges and accepts full responsibility for understanding these risks before placing
any order through the Software.`,
  },
  {
    header: `4. Limitation of Liability:-`,
    item: `The Company shall not be held liable for any losses, damages, or outcomes, financial or otherwise,
arising from the User’s use of the Software, including but not limited to trading decisions, software
errors, or any other unforeseen circumstances.`,
  },
  {
    header: `5. Performance Disclaimer:-`,
    item: `The performance of the Software depends on multiple factors, including the configuration of the
User’s system, the stability and speed of the User’s internet connection, and the responsiveness
of the broker’s API endpoints. The Company is not liable for any losses or adverse outcomes
resulting from issues with these factors.`,
  },
  {
    header: `6. Data Privacy and Security:-`,
    item: `The Company does not collect or store any API login credentials of Users. All login credentials are
stored locally on the User’s system. The User is solely responsible for maintaining the security and
confidentiality of such credentials.`,
  },
  {
    header: `7. Authorization and Consent:-`,
    item: `The User must ensure they have the appropriate authorization and approval from the owner(s) of
any trading account(s) accessed via the Software. The Company shall not be held responsible for
any disputes or claims arising from unauthorized access or use of third-party trading accounts.`,
  },
  {
    header: `8. No Warranty:-`,
    item: `The Software is provided “as is,” without any express or implied warranties, including but not
limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
`,
  },
  {
    header: `9. Third-Party Dependencies:-`,
    item: `The Software’s functionality relies on third-party broker APIs. The Company does not guarantee
the availability, accuracy, or performance of these APIs and is not responsible for any disruptions
or errors caused by them.
`,
  },
  {
    header: `10. User Accountability:-`,
    item: `The User agrees to use the Software responsibly and in compliance with applicable laws,
regulations, and broker terms. The Company shall not be held liable for any legal or regulatory
issues arising from the User’s actions.
`,
  },
  {
    header: `11. Indemnification:-`,
    item: `The User agrees to indemnify, defend, and hold harmless the Company, its affiliates, directors,
officers, and employees from any claims, liabilities, damages, or expenses arising from the User’s
use of the Software.
`,
  },
  {
    header: `12. Termination:-`,
    item: `The Company reserves the right to terminate or suspend access to the Software at its sole
discretion, without prior notice, if the User violates any terms of this Agreement.
`,
  },
  {
    header: `13. Governing Law and Jurisdiction:-`,
    item: `This Agreement shall be governed by and construed in accordance with the laws of India. Any
disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts
located in Delhi, India. All legal issues are to be handled in no other city than Delhi.
`,
  },
  {
    header: `14. Copyright and Intellectual Property:-`,
    item: `Wealthwisers Technologies Private Limited holds exclusive copyright over the Software and all
related intellectual property. Unauthorized distribution, replication, or reverse engineering of the
Software is strictly prohibited.`,
  },
  {
    header: `15. Updates to the Agreement:-`,
    item: `The Company reserves the right to amend or update this Agreement at any time. Continued use
of the Software constitutes acceptance of the revised terms.`,
  },
  {
    header: `16. Acceptance of Terms:-`,
    item: `By installing, accessing, or using the Software, the User acknowledges that they have read,
understood, and agreed to the terms and conditions of this Agreement.`,
  },
];

export default function RiskModal(props) {
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const closeHandler = () => {
    if (!agree || agree) {
      sessionStorage.clear("hasVisited");
      router.push("/home");
    }

    props.setToggle(false);
  };
  const handlerAgree = () => {
    setAgree(!agree);
  };
  const SubmitHandler = () => {
    if (agree) {
      sessionStorage.setItem("hasVisited", "true");
      props.setToggle(false);
    } else {
      setMessage(
        "Please agree with terms and condition by clicking the checkbox"
      );
    }
  };

  return (
    <div>
      <Modal
        scroll
        open={props.toggle}
        preventClose
        width="800px"
        css={{ height: "auto" }}
        blur
      >
        <Modal.Header>
          {" "}
          <Text h4 size={"$lg"} css={{ fontFamily: "$sans" }}>
            {" "}
            TradeAi1 Risk Disclosure and Agreement
          </Text>
        </Modal.Header>
        <Modal.Body css={{ border: "$accents2" }}>
          <div
            style={{
              alignItems: "center",
              width: "fit-content",
              marginLeft: "190px",
            }}
          ></div>
          <Spacer y={-1.7} />
          <Text
            h5
            size={"$md"}
            css={{
              width: "fit-content",
              marginLeft: "170px",
              fontFamily: "$sans",
            }}
          >
            Welcome to TradeAi1, your stock market trading platform.
          </Text>

          <Modal.Body>
            <div>
              <p style={{fontWeight:500}}>
                {/* Before you proceed, understand and acknowledge the risks:
                <br></br> */}
                This End User License Agreement (“Agreement”) is a legally
                binding document between Wealthwisers Technologies Private
                Limited (“Company”) and the user (“User”) of the software
                product TradeAI1 (“Software”). By installing, accessing, or
                using the Software, the User agrees to be bound by the terms and
                conditions set forth below. If the User does not agree, the User
                must immediately cease using the Software.
              </p>
              {licenseAgreement.map((elem, index) => (
                <Text
                  key={index + 1?.toString()}
                  h6
                  size={"$sm"}
                  css={{ fontFamily: "$sans" }}
                >
                  <span style={{ fontWeight: "bold" }}>{elem.header} </span>
                  {elem.item}
                </Text>
              ))}
              {/* <Text h6 size={"$sm"} css={{ fontFamily: "$sans" }}>
                2. Volatility Risk:- Securities can have rapid and unpredictable
                price movements. - Volatility presents opportunities for gains
                and risks substantial losses.
              </Text>
              <Text h6 size={"$sm"} css={{ fontFamily: "$sans" }}>
                {" "}
                3. Liquidity Risk:- Some securities may have limited liquidity.
                - Impact on the ability to buy/sell at desired prices. - No
                guarantee of a liquid market for all securities.
              </Text>
              <Text h6 size={"$sm"} css={{ fontFamily: "$sans" }}>
                4. Financial Leverage Risk:- Trading on margin amplifies both
                profits and losses. - Losses may exceed the initial investment.
                - Manage leverage risks carefully; trade with funds you can
                afford to lose.
              </Text>
              <Text h6 size={"$sm"} css={{ fontFamily: "$sans" }}>
                {" "}
                5. Regulatory and Operational Risks:- Regulatory changes can
                impact trading conditions. - Operational issues (e.g., technical
                glitches) may disrupt access. - TradeAi1 not liable for losses
                due to external factors.
              </Text> */}
              <Text h6 size={"$md"} css={{ fontFamily: "$sans" }}>
                <span style={{ fontWeight: "bold" }}>
                  Acknowledgment and Acceptance: -{" "}
                </span>
                By using TradeTezz, you acknowledge and understand the outlined
                risks. - Accept full responsibility for trading decisions and
                potential losses. - Seek independent financial advice before
                trading.
              </Text>
              <Text h5 css={{ fontWeight: "$bold" }}>
                Conclusion:- This Agreement is a binding contract between you
                and TradeTezz. - Refrain from using the platform if you disagree
                with the terms. - TradeAi1 reserves the right to update or
                modify this Agreement.
              </Text>
            </div>
          </Modal.Body>

          <Checkbox
            isRequired
            className="custom-checkbox"
            size="sm"
            css={{
              color: "#2C2C2C",
              ml: "$10",
              fontWeight: "bold",
              fontFamily: "$sans",
            }}
            onClick={handlerAgree}
          >
            {" "}
            Agree
          </Checkbox>
          {!agree && message}
        </Modal.Body>
        <Modal.Footer style={{ marginBottom: "15px", marginRight: "10px" }}>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            onClick={closeHandler}
          >
            Cancel
          </Button>

          <Button
            className="primary-button border-radius-8"
            auto
            flat
            onClick={SubmitHandler}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
