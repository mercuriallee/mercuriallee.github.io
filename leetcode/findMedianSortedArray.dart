class Solution {
  double findMedianRecursively(List<int> nums1, List<int> nums2, int n0, int m0, int n, int m) {
    if(n < m) return _findMedianSortedArrays(nums2, nums1, m0, n0, m, n);
    if(n == 0) return 0;
    if(m == 0) return (n % 2 == 1 ? nums1[n0+(n-1)~/2] : (nums1[n0+n~/2] + nums1[n0+n~/2-1])/2) as double;
    int midN = ((n0+n+1)~/2)-1;
    int lessMidNCount = findKth(nums1[midN] - 0.5, nums2, m0, m);
    //int lessEqualMidNCount = findKth(nums1[midN] + 0.5, nums2, m0, m);
    if((nums1.length + nums2.length)%2==1) {
      int midNM = (nums1.length+nums2.length)~/2;
      if(lessMidNCount + midN == midNM) return nums1[midN] as double;
      else if(lessMidNCount + midN < midNM) return findMedianRecursively(nums1, nums2, );
      else return 
    } else {
    }
  }

  /** returns 0,1,2...n */
  int findKth(double target, List<int> nums, int n0, int n) {
    int bottom = n0, top = n0+n-1, mid;
    double midValue;
    while(bottom <= top) {
      mid = bottom + (top-bottom)~/2;
      midValue = nums[mid] as double;
      if(target < midValue) {
        top = mid - 1;
      } else {
        bottom = mid + 1;
      }
    }
    return bottom-n0;
  }
}

