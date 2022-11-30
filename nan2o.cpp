#include<iostream>
using namespace std;
int main()
{
    int n;
    double tong=0;
    cout<<"Nhap n: ";
    cin>>n;
    // 1/(1^2) +1 /(3^2) +1/(5^2) +...+1/(2n+1)^2
    // ý tưởng: dùng vòng lặp for để tính tổng


    for(int i=1;i<=n;i++)
    {
        tong=tong+1.0/((2*i+1)*(2*i+1));
    }
    cout<<"Tong la: "<<tong;
}
