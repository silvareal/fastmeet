import React from "react";
import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { FormikProps } from "formik";

interface VideoMeetJoinFormProps {
  formik: FormikProps<{
    name: string;
    gender: string;
    meetId: string | undefined;
  }>;
}

export default function VideoMeetJoinForm({ formik }: VideoMeetJoinFormProps) {
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col  items-center w-full md:justify-around justify-center h-full"
    >
      <div className="w-full">
        <TextField
          autoFocus
          label="Name"
          placeholder="Sylvernus Akubo"
          fullWidth
          {...formik.getFieldProps("name")}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <RadioGroup
          aria-label="gender"
          row
          {...formik.getFieldProps("gender")}
          className="flex justify-center"
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
        </RadioGroup>
      </div>

      <Button size="large" fullWidth type="submit" className="mt-10">
        Join Meeting
      </Button>
    </form>
  );
}
