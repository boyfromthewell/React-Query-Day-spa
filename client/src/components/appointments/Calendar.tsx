/* eslint-disable max-lines-per-function */
import {
  Box,
  Checkbox,
  Grid,
  Heading,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ReactElement, useEffect } from 'react';
import { TiArrowLeftThick, TiArrowRightThick } from 'react-icons/ti';

import { queryKeys } from '../../react-query/constants';
import { UserAppointments } from '../user/UserAppointments';
import { DateBox } from './DateBox';
import { getNewMonthYear } from './hooks/monthYear';
import { getAppointments, useAppointments } from './hooks/useAppointments';

export function Calendar(): ReactElement {
  const queryClient = useQueryClient();

  const currentDate = dayjs();

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const { appointments, monthYear, updateMonthYear, showAll, setShowAll } =
    useAppointments();

  useEffect(() => {
    const nextMonthYear = getNewMonthYear(monthYear, 1);

    queryClient.prefetchQuery(
      [queryKeys.appointments, nextMonthYear.year, nextMonthYear.month],
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
    );
  }, [monthYear, queryClient]);

  return (
    <Box>
      <HStack mt={10} spacing={8} justify="center">
        <IconButton
          aria-label="previous month"
          onClick={() => updateMonthYear(-1)}
          icon={<TiArrowLeftThick />}
          isDisabled={monthYear.startDate < currentDate}
        />
        <Heading minW="40%" textAlign="center">
          {monthYear.monthName} {monthYear.year}
        </Heading>
        <IconButton
          aria-label="next month"
          onClick={() => updateMonthYear(1)}
          icon={<TiArrowRightThick />}
        />
        <Checkbox
          variant="flushed"
          width="48"
          position="absolute"
          right="10px"
          checked={!showAll}
          defaultIsChecked
          onChange={() => setShowAll((prevValue) => !prevValue)}
        >
          Only show available
        </Checkbox>
      </HStack>
      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={4}
        my={5}
        mx={10}
        textAlign="center"
      >
        {days.map((day) => (
          <div style={{ color: (day === 'SUN' || day === 'SAT') && 'red' }}>
            {day}
          </div>
        ))}
      </Grid>
      <Grid templateColumns="repeat(7, 1fr)" gap={4} my={5} mx={10}>
        {/* first day needs a grid column */}
        <DateBox
          date={1}
          gridColumn={monthYear.firstDOW + 1}
          appointments={appointments[1]}
        />
        {/* the rest of the days will follow */}
        {[...Array(monthYear.lastDate)].map((_, i) =>
          i > 0 ? (
            <DateBox key={i} date={i + 1} appointments={appointments[i + 1]} />
          ) : null,
        )}
      </Grid>
      <UserAppointments />
    </Box>
  );
}
