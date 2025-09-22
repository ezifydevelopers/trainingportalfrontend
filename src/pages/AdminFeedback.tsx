import React, { useState } from 'react';
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllFeedback, useGetFeedbackStats } from "@/hooks/useApi";
import { Star, MessageSquare, Users, TrendingUp, Filter } from "lucide-react";

export default function AdminFeedback() {
  const { data: feedback = [], isLoading, error } = useGetAllFeedback();
  const { data: stats } = useGetFeedbackStats();
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  // Get unique modules for filter
  const uniqueModules = Array.from(new Set(feedback.map(f => f.module.name)));

  // Filter feedback based on selected filters
  const filteredFeedback = feedback.filter(f => {
    const moduleMatch = filterModule === 'all' || f.module.name === filterModule;
    const ratingMatch = filterRating === 'all' || f.rating === parseInt(filterRating);
    return moduleMatch && ratingMatch;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading feedback...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Feedback</h3>
            <p className="text-gray-600">Failed to load feedback data. Please try again.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-gray-50 min-h-screen">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Trainee Feedback</h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">View and analyze trainee feedback for training modules</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Feedback</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.totalFeedback || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">responses received</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Average Rating</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">out of 5 stars</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Active Trainees</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {Array.from(new Set(feedback.map(f => f.trainee.id))).length}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">provided feedback</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Modules Rated</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {Array.from(new Set(feedback.map(f => f.module.id))).length}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">unique modules</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-0">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <p className="text-gray-600">Filter feedback by module and rating</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900">Module</label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base">All modules</SelectItem>
                  {uniqueModules.map(moduleName => (
                    <SelectItem key={moduleName} value={moduleName} className="text-base">
                      {moduleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900">Rating</label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base">All ratings</SelectItem>
                  <SelectItem value="5" className="text-base">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>5 stars (Excellent)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="4" className="text-base">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>4 stars (Very Good)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3" className="text-base">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>3 stars (Good)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2" className="text-base">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>2 stars (Fair)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1" className="text-base">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>1 star (Poor)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Enhanced Feedback List */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">All Feedback</h3>
                <p className="text-gray-600 mt-1">
                  Showing {filteredFeedback.length} of {feedback.length} feedback responses
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Feedback Found</h3>
                <p className="text-gray-600 text-lg">No feedback matches your current filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200">
                    <div className="space-y-4">
                      {/* Header with Module and Rating */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 break-words">{item.module.name}</h3>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getRatingColor(item.rating)} px-4 py-2 text-sm font-semibold`}>
                              <Star className="h-4 w-4 mr-2 fill-current" />
                              {item.rating} - {getRatingText(item.rating)}
                            </Badge>
                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trainee Info */}
                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.trainee.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.trainee.company?.name || 'No company assigned'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      {item.comment && (
                        <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-300">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-blue-600 font-medium mb-2">Trainee Comment</p>
                              <p className="text-blue-800 break-words">{item.comment}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 