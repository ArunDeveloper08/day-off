
import { Modal, Button, FormGroup, FormControl } from "react-bootstrap";

 const Dialog = ({ showModal, text, chartId, onClose, onSave }) => {
    const [localText, setLocalText] = useState(text);
  
    useEffect(() => {
      setLocalText(text);
    }, [text]);
  
    const handleChange = (e) => {
      setLocalText(e.target.value);
    };
  
    const handleSave = () => {
      onSave(localText, chartId);
    };
  
    return (
      <Modal show={showModal} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit text</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <form>
            <FormGroup controlId="text">
              {/* <ControlLabel>Text</ControlLabel> */}
              <FormControl
                type="text"
                value={localText}
                onChange={handleChange}
              />
            </FormGroup>
          </form>
        </Modal.Body>
  
        <Modal.Footer>
          <Button bsStyle="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  export default Dialog;