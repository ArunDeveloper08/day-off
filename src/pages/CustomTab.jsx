import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Sop from './Sop';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function CustomTab() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} sx={{ justifyContent: 'space-around' }} centered>
          <Tab label="Read and Create SOP" {...a11yProps(0)} sx={{ flexGrow: 1 }} />
          {/* <Tab label="Read SOP" {...a11yProps(1)} sx={{ flexGrow: 1 }} /> */}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
       <Sop/>
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel> */}
    </Box>
  );
}
