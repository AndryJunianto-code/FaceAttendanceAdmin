import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Fade,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateRangePicker } from '@mui/x-date-pickers-pro';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween' // import plugin
  ; // import plugin
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';


import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import Lottie from 'lottie-react';
import { io } from 'socket.io-client';
import successAnimation from '../../../../public/assets/success.json'; // Add your Lottie file here

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';


// ----------------------------------------------------------------------
// Define types for the data you're working with
interface ValidationData {
  id: string;
  user_id: string;
  name:string;
  date: string;
  time: string;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};


export function UserView() {
  dayjs.extend(isBetween);
  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: UserProps[] = applyFilter({
    inputData: _users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const [validationData, setValidationData] = useState<ValidationData[]>([]);
  const [filteredData, setFilteredData] = useState<ValidationData[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof ValidationData>('date');
  const [radioSelections, setRadioSelections] = useState<{ [key: string]: string }>({});
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD'),
  ]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });
    socket.on('validation_update', () => {
      fetchValidationData(); // Refetch validation data on update
    });
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false)


  useEffect(() => {
    fetchValidationData();
  }, []);

  const applyDateFilter = useCallback(() => {
    if (dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      const filtered = validationData.filter((item) =>
        dayjs(item.date).isBetween(startDate, endDate, 'day', '[]')
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(validationData);
    }
  }, [validationData, dateRange]);

  useEffect(() => {
    applyDateFilter();
  }, [validationData, dateRange,applyDateFilter]);

  const fetchValidationData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/validation');
      setValidationData(response.data);
      setFilteredData(response.data);
      // Fetch attendance statuses for each user
      
    } catch (error) {
      console.error('Error fetching validation data', error);
    }
  };


  const handleRadioChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRadioSelections((prevState) => ({
      ...prevState,
      [id]: event.target.value, // Update the value for the specific row
    }));
  };

  const handleSort = (property: keyof ValidationData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const sortedData = [...filteredData].sort((a, b) => {
      const valA = a[property];
      const valB = b[property];
      return (valA < valB ? -1 : 1) * (isAsc ? 1 : -1);
    });

    setFilteredData(sortedData);
  };

  const handleDateChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = [...dateRange] as [string, string];
    newRange[index] = event.target.value;
    setDateRange(newRange as [string, string]);
  };

  const handleValidation = async (id: string, status: string, user_id: string, name: string, formattedDate: string, time:string) => {
    try {
      await axios.post('http://localhost:5000/validate_attendance', { id, status });
      setOpen(true);
      setValidationData(validationData.filter((row) => row.id !== id));
    } catch (error) {
      console.error('Error validating attendance', error);
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Validation
        </Typography>
        {/*  <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New user
        </Button> */}
      </Box>

      <Card>
      <Box paddingX='2rem' paddingTop='2rem'>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange[0]}
              onChange={handleDateChange(0)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={dateRange[1]}
              onChange={handleDateChange(1)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Box>

        <Scrollbar>
          <TableContainer component={Paper} sx={{ padding: '2rem' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'user_id'}
                      direction={orderBy === 'user_id' ? order : 'asc'}
                      onClick={() => handleSort('user_id')}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'time'}
                      direction={orderBy === 'time' ? order : 'asc'}
                      onClick={() => handleSort('time')}
                    >
                      Time
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row) => {
                   const date = new Date(row.date);
                   const formattedDate = date.toLocaleDateString('en-GB', {
                     weekday: 'short',  // "Thu"
                     day: '2-digit',    // "28"
                     month: 'short',    // "Nov"
                     year: 'numeric'    // "2024"
                   });
return (
                    <TableRow key={row.id}>
                      <TableCell>{row.user_id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{row.time}</TableCell>
                      <TableCell sx={{px:0, py:'0.2rem'}}>
                        <Stack direction='row' alignItems='center'>
                          <FormControl>
                            <RadioGroup
                              row
                              aria-labelledby="demo-form-control-label-placement"
                              name={`radio-${row.id}`}
                              value={radioSelections[row.id] || 'Masuk'} 
                              onChange={handleRadioChange(row.id)}
                              >
                              <FormControlLabel
                                value="Masuk"
                                control={<Radio />}
                                label="Masuk"
                                labelPlacement="bottom"
                              />
                              <FormControlLabel
                                value="Keluar"
                                control={<Radio />}
                                label="Keluar"
                                labelPlacement="bottom"
                              />
                               <FormControlLabel
                                value="Pulang"
                                control={<Radio />}
                                label="Pulang"
                                labelPlacement="bottom"
                              />
                            </RadioGroup>
                          </FormControl>
                          <Box ml='0.4rem'>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleValidation(row.id, radioSelections[row.id] || 'Masuk', row.user_id, row.name, formattedDate, row.time)}
                            >
                              Save
                            </Button>
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
)})}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {/* <TablePagination
          component="div"
          page={table.page}
          count={_users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        /> */}
      </Card>
      <Modal open={open}
        onClose={handleClose}
        closeAfterTransition
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description">
          <Fade in={open}>
          <Box sx={style}>
            {/* Animation Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {/* Use Lottie for animation */}
              <Lottie
                animationData={successAnimation}
                loop={false}
                style={{ height: 80 }}
              />

              {/* Fallback to Material Icon if Lottie isn't available */}
              {/* <CheckCircleOutlineIcon
                sx={{ fontSize: 80, color: 'green' }}
              /> */}
            </Box>

            {/* Success Text */}
            <Typography
              id="success-modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 1 }}
            >
              Successfully Validated
            </Typography>
            {/* Manual Close Button */}
            <Button variant="outlined" color="primary" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Fade> 
    </Modal>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  /* const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  ); */

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    /* onResetPage, */
    /* onChangePage, */
    onSelectAllRows,
    /* onChangeRowsPerPage, */
  };
}
