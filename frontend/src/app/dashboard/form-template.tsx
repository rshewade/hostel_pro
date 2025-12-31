'use client';

import React from 'react';
import { Container, Grid, Col, Stack } from '@/components/layout';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Checkbox } from '@/components/forms/Checkbox';

const ResponsiveFormTemplate: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container size="lg">
        <Card padding="lg">
          <h1 className="text-2xl font-bold text-navy-900 mb-6">Application Form</h1>

          <form>
            <Stack gap={6}>
              <Grid gap="md">
                <Col span={{ xs: 12, md: 6 }}>
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    required
                  />
                </Col>
                <Col span={{ xs: 12, md: 6 }}>
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                  />
                </Col>
              </Grid>

              <Grid gap="md">
                <Col span={{ xs: 12, md: 4 }}>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                  />
                </Col>
                <Col span={{ xs: 12, md: 4 }}>
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+91XXXXXXXXXX"
                  />
                </Col>
                <Col span={{ xs: 12, md: 4 }}>
                  <Select
                    label="Gender"
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </Col>
              </Grid>

              <Grid gap="md">
                <Col span={{ xs: 12, md: 6 }}>
                  <Select
                    label="Course"
                    options={[
                      { value: '', label: 'Select Course' },
                      { value: 'btech', label: 'B.Tech' },
                      { value: 'mtech', label: 'M.Tech' },
                      { value: 'bsc', label: 'B.Sc' },
                      { value: 'msc', label: 'M.Sc' },
                    ]}
                  />
                </Col>
                <Col span={{ xs: 12, md: 6 }}>
                  <Select
                    label="Year"
                    options={[
                      { value: '', label: 'Select Year' },
                      { value: '1', label: '1st Year' },
                      { value: '2', label: '2nd Year' },
                      { value: '3', label: '3rd Year' },
                      { value: '4', label: '4th Year' },
                    ]}
                  />
                </Col>
              </Grid>

              <Grid gap="md">
                <Col span={{ xs: 12, lg: 8 }}>
                  <Input
                    label="Institution Name"
                    placeholder="Enter institution name"
                  />
                </Col>
                <Col span={{ xs: 12, lg: 4 }}>
                  <Input
                    label="Roll Number"
                    placeholder="Enter roll number"
                  />
                </Col>
              </Grid>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Address Details</h2>

                <Stack gap={4}>
                  <Input
                    label="Street Address"
                    placeholder="Enter street address"
                  />

                  <Grid gap="md">
                    <Col span={{ xs: 12, md: 4 }}>
                      <Input label="City" placeholder="Enter city" />
                    </Col>
                    <Col span={{ xs: 12, md: 4 }}>
                      <Select
                        label="State"
                        options={[
                          { value: '', label: 'Select State' },
                          { value: 'delhi', label: 'Delhi' },
                          { value: 'maharashtra', label: 'Maharashtra' },
                          { value: 'karnataka', label: 'Karnataka' },
                          { value: 'rajasthan', label: 'Rajasthan' },
                        ]}
                      />
                    </Col>
                    <Col span={{ xs: 12, md: 4 }}>
                      <Input label="PIN Code" placeholder="123456" />
                    </Col>
                  </Grid>
                </Stack>
              </div>

              <div className="border-t pt-6">
                <Stack gap={3}>
                  <Checkbox
                    id="terms"
                    label="I agree to the terms and conditions"
                  />
                  <Checkbox
                    id="newsletter"
                    label="Subscribe to newsletter for updates"
                  />
                </Stack>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="primary" type="submit">
                  Submit Application
                </Button>
                <Button variant="secondary" type="button">
                  Save as Draft
                </Button>
              </div>
            </Stack>
          </form>
        </Card>
      </Container>
    </div>
  );
};

export default ResponsiveFormTemplate;
