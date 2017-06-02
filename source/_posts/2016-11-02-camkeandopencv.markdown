---
layout: post
title: "CMake编译NDK，以及在OpenCV中的应用"
date: 2016-11-02 15:01:26 +0800
comments: true
categories: ndk
tags: [CMake,NDK,OpenCV]
---

## 在最新的android studio下开始友好支持CMake对C++/C的支持

其简单的使用方法：
1、 添加app/src/jni/name.cpp文件，注意对于android的视图中则显示在cpp文件夹下。

例如这个函数是将图片进行黑白转换

```c

#include <jni.h>
#include <string>
#include <opencv2/core.hpp>

extern "C" {
jstring
Java_com_exexample_opencvandar_NdkLoader_stringFromJNI(
        JNIEnv *env,
        jobject /* this */) {
    std::string hello = "opencv图像处理";
    return env->NewStringUTF(hello.c_str());
}
jstring
Java_com_exexample_opencvandar_NdkLoader_validate(
        JNIEnv *env,
        jobject,
        jlong addrGray,
        jlong addrRgba){
    std::string hello2 = "Hello from validate";
    return env->NewStringUTF(hello2.c_str());
}
}
//图像处理
extern "C"
JNIEXPORT jintArray JNICALL
Java_com_exexample_opencvandar_NdkLoader_getGrayImage(
        JNIEnv *env,
        jclass type,
        jintArray pixels_,
        jint w, jint h) {
    jint *pixels = env->GetIntArrayElements(pixels_, NULL);
    // TODO
    if(pixels==NULL){
        return NULL;
    }
    cv::Mat imgData(h, w, CV_8UC4, pixels);
    uchar *ptr = imgData.ptr(0);
    for (int i = 0; i < w * h; i++) {
        int grayScale = (int) (ptr[4 * i + 2] * 0.299 + ptr[4 * i + 1] * 0.587
                               + ptr[4 * i + 0] * 0.114);
        ptr[4 * i + 1] = (uchar) grayScale;
        ptr[4 * i + 2] = (uchar) grayScale;
        ptr[4 * i + 0] = (uchar) grayScale;
    }

    int size = w * h;
    jintArray result = env->NewIntArray(size);
    env->SetIntArrayRegion(result, 0, size, pixels);
    env->ReleaseIntArrayElements(pixels_, pixels, 0);
    return result;
}


```

<!--more-->

2、 在app文件下添加“CMakeLists.txt”文件，

```c

# Sets the minimum version of CMake required to build the native
# library. You should either keep the default value or only pass a
# value of 3.4.0 or lower.
#工程路径
set(pathToProject D:/adroid_studio_projects/OpenCV/MyApplication)
#OpenCV-android-sdk路径
set(pathToOpenCv D:/OpenCV/OpenCV-android-sdk)
#CMake版本信息
cmake_minimum_required(VERSION 3.4.1)
#支持-std=gnu++11
set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++11")
#CPP文件夹下带编译的cpp文件
add_library( native-lib SHARED src/main/jni/native-lib.cpp )
#配置加载native依赖
include_directories(${pathToOpenCv}/sdk/native/jni/include)

#动态方式加载
add_library( lib_opencv SHARED IMPORTED )

#引入libopencv_java3.so文件
set_target_properties(lib_opencv PROPERTIES IMPORTED_LOCATION
${pathToProject}/app/src/main/jniLibs/${ANDROID_ABI}/libopencv_java3.so)

#C++日志
find_library( log-lib log )

#target_link_libraries( native-lib $\{log-lib} )
target_link_libraries( native-lib $\{log-lib} lib_opencv)

```

**关于路径一定要用英文，中文加载会失败，但是并不会报错**
 
[详细介绍点此（自行出墙）](https://developer.android.com/studio/projects/add-native-code.html)

3、在app的gradle下添加

```java

defaultConfig {
        ...
        externalNativeBuild {
            cmake {
                cppFlags "-std=c++11 -frtti -fexceptions" //意义介绍请走上述传送门
				abiFilters 'armeabi', 'armeabi-v7a', 'arm64-v8a'//使用常见的三种abi，缩减jniLibs下的.so，减小apk体积。
            }
        }
    }
   
    externalNativeBuild {
        cmake {
            path 'CMakeLists.txt'  //指定文件路径
        }
    }

```

## OpenCV 在android studio2.2以上的搭建过程

第一步，下载[OpenCV-android-sdk](http://opencv.org/downloads.html)。

第二步，建立工程，然后File  New  Import Module将OpenCV-3.1.0-android-sdk\OpenCV-android-sdk\sdk\java并导入OpenCV-android-sdk的Library.将openCVLibrary310下的gradle文件的buildToolsVersion、compileSdkVwesion等改成和工程一样版本。

第三步、将OpenCV-android-sdk\sdk\native\libs下的libs文件拷贝到main目录下，重命名为jniLibs

第四步、在APP下的build.gradle文件下增加sourceSet，指定到jniLibs上，此步可以省略，因为默认的JNI路径就是main/jniLibs

第五步：在主函数中

```java

static {
        System.loadLibrary("native-lib");
        System.loadLibrary("opencv_java3");
    }

    /**
     * A native method that is implemented by the 'native-lib' native library,
     * which is packaged with this application.
     */
    public static native String stringFromJNI();

    public static native String validate(long matAddrGr, long matAddrRgba);

    //图像处理
    public static native int[] getGrayImage(int[] pixels, int w, int h);

```

## 参考资料

[ OpenCV4Android释疑: 透析Android以JNI调OpenCV的三种方式(让OpenCVManager永不困扰)](http://blog.csdn.net/yanzi1225627/article/details/27863615)