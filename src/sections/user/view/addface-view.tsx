import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Input, Paper, Stack, TableCell, TableHead, TableRow,TableSortLabel, TextField } from '@mui/material';
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



// ----------------------------------------------------------------------


export function AddFaceView() {
    const webcamRef = useRef<Webcam | null>(null);
    
  const videoConstraints: MediaStreamConstraints = {
    video: {
      width: 1280,
      height: 720,
      facingMode: 'user',
    },
  };

  const [videoReady, setVideoReady] = useState<boolean>(false);
 
  const handleVideoReady = () => setVideoReady(true);

  const capturePhoto = async () => {
    const personName = prompt('Enter NPM: ');

    try {
        const response = await axios.post('http://localhost:5000/dataset_generator', {
            person_name: personName,
        });
        console.log(response.data.message); // You can display the message in your UI
    } catch (error) {
        console.error('Error during image capture:', error);
    }
};
  



  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Add Face
        </Typography>
        
      </Box>

      <Stack direction='column' alignContent='center' justifyContent='center' width='640px'>
     {/*   <Webcam
        audio={false}
        ref={webcamRef}
        onUserMedia={handleVideoReady}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints.video}
        style={{ width: '640px', height: '360px'}}
      /> */}
      {/* <Typography sx={{textAlign:'center', my:'1rem'}}>100 Pictures Taken</Typography> */}
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{mt:'1rem'}}
          onClick={capturePhoto}
        >
          Add
        </Button>
     </Stack>
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

  const onResetPage = useCallback(() => {
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
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
