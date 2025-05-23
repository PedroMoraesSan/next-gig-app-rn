import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { useLazyQuery } from '@apollo/client';
import JobCard from '../components/JobCard';
import { SEARCH_JOBS, GET_JOBS } from '../graphql/queries/jobs';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';

// Job type definition
type Job = {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: string;
  tags: string[];
  salary: string;
  description: string;
  postedDate: string;
};

// Filter options type
type FilterOptions = {
  jobType: string[];
  location: string;
  salary: string;
  datePosted: string;
  remote: boolean;
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    jobType: [],
    location: '',
    salary: '',
    datePosted: '',
    remote: false
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    jobType: [],
    location: '',
    salary: '',
    datePosted: '',
    remote: false
  });
  
  // Search with term
  const [searchJobs, { loading: searchLoading, data: searchData, error: searchError, fetchMore: searchFetchMore }] = 
    useLazyQuery(SEARCH_JOBS);
  
  // Get jobs with filters
  const [getJobs, { loading: jobsLoading, data: jobsData, error: jobsError, fetchMore: jobsFetchMore }] = 
    useLazyQuery(GET_JOBS);
  
  // Determine which query to use based on whether we have a search term
  const loading = searchLoading || jobsLoading;
  const error = searchError || jobsError;
  const data = searchTerm ? searchData : jobsData;
  const fetchMore = searchTerm ? searchFetchMore : jobsFetchMore;
  
  // Job type options
  const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Internship',
    'Freelance'
  ];
  
  // Salary range options
  const salaryOptions = [
    'Any',
    'Under $50k',
    '$50k - $80k',
    '$80k - $100k',
    '$100k - $150k',
    '$150k+'
  ];
  
  // Date posted options
  const datePostedOptions = [
    'Any time',
    'Past 24 hours',
    'Past week',
    'Past month'
  ];
  
  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchJobs({ 
        variables: { 
          searchTerm: `%${searchTerm}%`, 
          limit: 10,
          offset: 0
        } 
      });
    }
  };
  
  // Handle filter search
  const handleFilterSearch = () => {
    // Build where clause for GraphQL query
    const whereClause: any = {};
    
    // Add job type filter
    if (appliedFilters.jobType.length > 0) {
      whereClause.job_type = { _in: appliedFilters.jobType };
    }
    
    // Add location filter
    if (appliedFilters.location) {
      whereClause.location = { _ilike: `%${appliedFilters.location}%` };
    }
    
    // Add remote filter
    if (appliedFilters.remote) {
      whereClause.location = { ...whereClause.location, _ilike: '%remote%' };
    }
    
    // Add salary filter
    if (appliedFilters.salary && appliedFilters.salary !== 'Any') {
      // Parse salary range
      if (appliedFilters.salary === 'Under $50k') {
        whereClause.salary_min = { _lte: 50000 };
      } else if (appliedFilters.salary === '$50k - $80k') {
        whereClause.salary_min = { _gte: 50000 };
        whereClause.salary_max = { _lte: 80000 };
      } else if (appliedFilters.salary === '$80k - $100k') {
        whereClause.salary_min = { _gte: 80000 };
        whereClause.salary_max = { _lte: 100000 };
      } else if (appliedFilters.salary === '$100k - $150k') {
        whereClause.salary_min = { _gte: 100000 };
        whereClause.salary_max = { _lte: 150000 };
      } else if (appliedFilters.salary === '$150k+') {
        whereClause.salary_min = { _gte: 150000 };
      }
    }
    
    // Add date posted filter
    if (appliedFilters.datePosted && appliedFilters.datePosted !== 'Any time') {
      const now = new Date();
      let fromDate = new Date();
      
      if (appliedFilters.datePosted === 'Past 24 hours') {
        fromDate.setDate(now.getDate() - 1);
      } else if (appliedFilters.datePosted === 'Past week') {
        fromDate.setDate(now.getDate() - 7);
      } else if (appliedFilters.datePosted === 'Past month') {
        fromDate.setMonth(now.getMonth() - 1);
      }
      
      whereClause.posted_date = { _gte: fromDate.toISOString() };
    }
    
    // Execute query
    getJobs({
      variables: {
        limit: 10,
        offset: 0,
        where: whereClause
      }
    });
  };
  
  // Apply filters and close modal
  const applyFilters = () => {
    setAppliedFilters(filterOptions);
    setFilterModalVisible(false);
    
    // If we have a search term, clear it and use filter search instead
    if (searchTerm) {
      setSearchTerm('');
    }
    
    // Execute filter search
    handleFilterSearch();
  };
  
  // Reset filters
  const resetFilters = () => {
    const emptyFilters = {
      jobType: [],
      location: '',
      salary: '',
      datePosted: '',
      remote: false
    };
    
    setFilterOptions(emptyFilters);
    
    // If applied filters are not empty, reset them and search again
    if (
      appliedFilters.jobType.length > 0 || 
      appliedFilters.location || 
      appliedFilters.salary || 
      appliedFilters.datePosted || 
      appliedFilters.remote
    ) {
      setAppliedFilters(emptyFilters);
      
      // If we have a search term, use that
      if (searchTerm) {
        handleSearch();
      } else {
        // Otherwise get all jobs
        getJobs({
          variables: {
            limit: 10,
            offset: 0
          }
        });
      }
    }
  };
  
  // Toggle job type selection
  const toggleJobType = (type: string) => {
    setFilterOptions(prev => {
      if (prev.jobType.includes(type)) {
        return {
          ...prev,
          jobType: prev.jobType.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          jobType: [...prev.jobType, type]
        };
      }
    });
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (data && data.jobs && data.jobs.length >= 10) {
      if (searchTerm) {
        searchFetchMore({
          variables: {
            offset: data.jobs.length,
            limit: 10,
            searchTerm: `%${searchTerm}%`
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              jobs: [...prev.jobs, ...fetchMoreResult.jobs]
            };
          }
        });
      } else {
        jobsFetchMore({
          variables: {
            offset: data.jobs.length,
            limit: 10,
            where: buildWhereClause()
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              jobs: [...prev.jobs, ...fetchMoreResult.jobs]
            };
          }
        });
      }
    }
  };
  
  // Build where clause for GraphQL query
  const buildWhereClause = () => {
    const whereClause: any = {};
    
    if (appliedFilters.jobType.length > 0) {
      whereClause.job_type = { _in: appliedFilters.jobType };
    }
    
    if (appliedFilters.location) {
      whereClause.location = { _ilike: `%${appliedFilters.location}%` };
    }
    
    if (appliedFilters.remote) {
      whereClause.location = { ...whereClause.location, _ilike: '%remote%' };
    }
    
    return whereClause;
  };
  
  // Initial load
  useEffect(() => {
    getJobs({
      variables: {
        limit: 10,
        offset: 0
      }
    });
  }, []);
  
  // Use mock data if API isn't available yet
  const useMockData = error;
  const { mockJobs } = require('../constants/mockData');
  
  // Filter mock jobs based on search term and filters
  const filterMockJobs = (jobs: Job[]) => {
    return jobs.filter(job => {
      // Search term filter
      if (searchTerm && !(
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }
      
      // Job type filter
      if (appliedFilters.jobType.length > 0 && !appliedFilters.jobType.includes(job.type)) {
        return false;
      }
      
      // Location filter
      if (appliedFilters.location && !job.location.toLowerCase().includes(appliedFilters.location.toLowerCase())) {
        return false;
      }
      
      // Remote filter
      if (appliedFilters.remote && !job.location.toLowerCase().includes('remote')) {
        return false;
      }
      
      return true;
    });
  };
  
  const searchResults = useMockData 
    ? filterMockJobs(mockJobs)
    : data?.jobs || [];
  
  // Count applied filters
  const countAppliedFilters = () => {
    let count = 0;
    if (appliedFilters.jobType.length > 0) count++;
    if (appliedFilters.location) count++;
    if (appliedFilters.salary) count++;
    if (appliedFilters.datePosted) count++;
    if (appliedFilters.remote) count++;
    return count;
  };
  
  const appliedFiltersCount = countAppliedFilters();
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-1">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Search Jobs</Text>
        
        {/* Search Bar */}
        <View className="flex-row mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-l-lg p-3"
            placeholder="Job title, company, or keyword"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            className="bg-primary px-4 justify-center rounded-r-lg"
            onPress={handleSearch}
          >
            <Text className="text-white font-medium">Search</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Bar */}
        <View className="flex-row mb-4">
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg p-3"
            onPress={() => setFilterModalVisible(true)}
          >
            <Text className="mr-2">Filters</Text>
            {appliedFiltersCount > 0 && (
              <View className="bg-primary rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs">{appliedFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Loading Indicator */}
        {loading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#0070f3" />
          </View>
        )}
        
        {/* Error Message */}
        {error && !useMockData && (
          <Text className="text-red-500 text-center py-4">
            Error loading jobs: {error.message}
          </Text>
        )}
        
        {/* No Results Message */}
        {searchResults.length === 0 && !loading && (
          <Text className="text-center py-8 text-gray-500">
            No jobs found matching your criteria
          </Text>
        )}
        
        {/* Results List */}
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard 
                job={item} 
                onSave={() => {
                  // Handle save job functionality
                  console.log('Save job:', item.id);
                }}
              />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReached={!useMockData ? handleLoadMore : null}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && !useMockData ? (
                <ActivityIndicator size="small" color="#0070f3" style={{ marginVertical: 20 }} />
              ) : null
            }
          />
        )}
        
        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
              <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Text className="text-gray-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold">Filters</Text>
                <TouchableOpacity onPress={resetFilters}>
                  <Text className="text-primary">Reset</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView className="flex-1 p-4">
                {/* Job Type Filter */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Job Type</Text>
                  <View className="flex-row flex-wrap">
                    {jobTypeOptions.map((type) => (
                      <TouchableOpacity
                        key={type}
                        className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                          filterOptions.jobType.includes(type) 
                            ? 'bg-primary' 
                            : 'bg-gray-100'
                        }`}
                        onPress={() => toggleJobType(type)}
                      >
                        <Text 
                          className={filterOptions.jobType.includes(type) 
                            ? 'text-white' 
                            : 'text-gray-800'
                          }
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Location Filter */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Location</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="City, state, or zip code"
                    value={filterOptions.location}
                    onChangeText={(text) => setFilterOptions(prev => ({ ...prev, location: text }))}
                  />
                  
                  {/* Remote Option */}
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-base">Remote only</Text>
                    <Switch
                      value={filterOptions.remote}
                      onValueChange={(value) => setFilterOptions(prev => ({ ...prev, remote: value }))}
                      trackColor={{ false: '#d1d5db', true: '#0070f3' }}
                      thumbColor={Platform.OS === 'ios' ? '#ffffff' : filterOptions.remote ? '#ffffff' : '#f4f3f4'}
                    />
                  </View>
                </View>
                
                {/* Salary Filter */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Salary Range</Text>
                  <View className="flex-row flex-wrap">
                    {salaryOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                          filterOptions.salary === option 
                            ? 'bg-primary' 
                            : 'bg-gray-100'
                        }`}
                        onPress={() => setFilterOptions(prev => ({ ...prev, salary: option }))}
                      >
                        <Text 
                          className={filterOptions.salary === option 
                            ? 'text-white' 
                            : 'text-gray-800'
                          }
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Date Posted Filter */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Date Posted</Text>
                  <View className="flex-row flex-wrap">
                    {datePostedOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                          filterOptions.datePosted === option 
                            ? 'bg-primary' 
                            : 'bg-gray-100'
                        }`}
                        onPress={() => setFilterOptions(prev => ({ ...prev, datePosted: option }))}
                      >
                        <Text 
                          className={filterOptions.datePosted === option 
                            ? 'text-white' 
                            : 'text-gray-800'
                          }
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
              
              <View className="p-4 border-t border-gray-200">
                <Button
                  title="Apply Filters"
                  onPress={applyFilters}
                  fullWidth={true}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
