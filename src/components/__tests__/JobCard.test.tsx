import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import JobCard from '../JobCard';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    companyLogo: 'https://example.com/logo.png',
    location: 'San Francisco, CA',
    type: 'Full-time',
    tags: ['React', 'TypeScript'],
    salary: '$120k - $150k',
  };
  
  it('renders correctly', () => {
    const { getByText } = render(<JobCard job={mockJob} />);
    
    expect(getByText('Software Engineer')).toBeTruthy();
    expect(getByText('Tech Corp')).toBeTruthy();
    expect(getByText('San Francisco, CA')).toBeTruthy();
    expect(getByText('Full-time')).toBeTruthy();
    expect(getByText('$120k - $150k')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
  });
  
  it('calls onSave when save button is pressed', () => {
    const onSaveMock = jest.fn();
    const { getByText } = render(
      <JobCard job={mockJob} onSave={onSaveMock} />
    );
    
    fireEvent.press(getByText('♡'));
    expect(onSaveMock).toHaveBeenCalled();
  });
  
  it('displays saved icon when job is saved', () => {
    const { getByText } = render(
      <JobCard job={mockJob} onSave={() => {}} saved={true} />
    );
    
    expect(getByText('♥')).toBeTruthy();
  });
  
  it('displays unsaved icon when job is not saved', () => {
    const { getByText } = render(
      <JobCard job={mockJob} onSave={() => {}} saved={false} />
    );
    
    expect(getByText('♡')).toBeTruthy();
  });
  
  it('displays View Details text', () => {
    const { getByText } = render(<JobCard job={mockJob} />);
    
    expect(getByText('View Details')).toBeTruthy();
  });
  
  it('truncates tags when there are more than 3', () => {
    const jobWithManyTags = {
      ...mockJob,
      tags: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'GraphQL']
    };
    
    const { getByText } = render(<JobCard job={jobWithManyTags} />);
    
    expect(getByText('React')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('JavaScript')).toBeTruthy();
    expect(getByText('+2 more')).toBeTruthy();
  });
});
