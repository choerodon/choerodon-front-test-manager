import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Tabs, Select, Table, Badge,
} from 'choerodon-ui';
import './TestNGReport.scss';

const { TabPane } = Tabs;
const { Option } = Select;
const toArray = any => (any instanceof Array ? any : [any]);
const data = {
  'testng-results': {
    'reporter-output': '',
    ignored: 1,
    total: 25,
    suite: [
      {
        test: [
          {
            'started-at': '2019-02-13T02:04:24Z',
            name: 'test1',
            'finished-at': '2019-02-13T02:04:24Z',
            class: {
              'test-method': [
                {
                  'reporter-output': '',
                  signature: 'isEmpty()[pri:0, instance:io.choerodon.testng.demo.UnitTest@6ad5c04e]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'isEmpty',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 1,
                },
                {
                  'reporter-output': '',
                  signature: 'trim()[pri:0, instance:io.choerodon.testng.demo.UnitTest@6ad5c04e]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'trim',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
              ],
              name: 'io.choerodon.testng.demo.UnitTest',
            },
            'duration-ms': 2,
          },
          {
            'started-at': '2019-02-13T02:04:24Z',
            name: 'test2',
            'finished-at': '2019-02-13T02:04:24Z',
            class: {
              'test-method': [
                {
                  'reporter-output': '',
                  signature: 'groupTest1()[pri:0, instance:io.choerodon.testng.demo.GroupTest@16c0663d]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'groupTest1',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'groupTest3(java.lang.String)[pri:0, instance:io.choerodon.testng.demo.GroupTest@16c0663d]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'groupTest3',
                  params: {
                    param: {
                      index: 0,
                      value: 'mysql',
                    },
                  },
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
              ],
              name: 'io.choerodon.testng.demo.GroupTest',
            },
            'duration-ms': 3,
          },
          {
            'started-at': '2019-02-13T02:04:24Z',
            name: 'test3',
            'finished-at': '2019-02-13T02:04:24Z',
            class: {
              'test-method': [
                {
                  'reporter-output': '',
                  signature: 'beforeTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 1,
                },
                {
                  'reporter-output': '',
                  signature: 'beforeClassTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeClassTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'beforeMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 1,
                },
                {
                  'reporter-output': '',
                  signature: 'dataProviderTest(java.lang.String, java.lang.Integer)[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'dataProviderTest',
                  'data-provider': 'dataProvider',
                  params: {
                    param: [
                      {
                        index: 0,
                        value: 'Cedric',
                      },
                      {
                        index: 1,
                        value: '36',
                      },
                    ],
                  },
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'afterMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'beforeMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 1,
                },
                {
                  'reporter-output': '',
                  signature: 'dataProviderTest(java.lang.String, java.lang.Integer)[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'dataProviderTest',
                  'data-provider': 'dataProvider',
                  params: {
                    param: [
                      {
                        index: 0,
                        value: 'Anne',
                      },
                      {
                        index: 1,
                        value: '37',
                      },
                    ],
                  },
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'dataProviderTest(java.lang.String, java.lang.Integer)[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'dataProviderTest',
                  'data-provider': 'dataProvider',
                  params: {
                    param: [
                      {
                        index: 0,
                        value: 'Jay',
                      },
                      {
                        index: 1,
                        value: '30',
                      },
                    ],
                  },
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'afterMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'beforeMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'dataProviderTest(java.lang.String, java.lang.Integer)[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'dataProviderTest',
                  'data-provider': 'dataProvider',
                  params: {
                    param: [
                      {
                        index: 0,
                        value: 'Chen',
                      },
                      {
                        index: 1,
                        value: '25',
                      },
                    ],
                  },
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'afterMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'beforeMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'afterMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'beforeMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'dependsOnMethodsTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'dependsOnMethodsTest',
                  'depends-on-methods': 'io.choerodon.testng.demo.AnnotationTest.dataProviderTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 1,
                },
                {
                  'reporter-output': '',
                  signature: 'afterClassTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterClassTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'afterMethodTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterMethodTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'afterTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'afterTest',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
              ],
              name: 'io.choerodon.testng.demo.AnnotationTest',
            },
            'duration-ms': 7,
          },
          {
            'started-at': '2019-02-13T02:04:24Z',
            name: 'test4',
            'finished-at': '2019-02-13T02:04:24Z',
            class: {
              'test-method': [
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@2133c8f8]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@3ac3fd8b]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@1e643faf]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@34ce8af7]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@43a25848]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@3b6eb2ec]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@6e8dacdf]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@7a79be86]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@5594a1b5]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
                {
                  'reporter-output': '',
                  signature: 'testServer()[pri:0, instance:io.choerodon.testng.demo.FactoryTestIntance@6a5fc7f7]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'testServer',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'PASS',
                  'duration-ms': 0,
                },
              ],
              name: 'io.choerodon.testng.demo.FactoryTestIntance',
            },
            'duration-ms': 4,
          },
          {
            'started-at': '2019-02-13T02:04:24Z',
            name: 'test5',
            'finished-at': '2019-02-13T02:04:24Z',
            class: [
              {
                'test-method': [
                  {
                    'reporter-output': '',
                    signature: 'beforeSuiteTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                    'is-config': true,
                    'started-at': '2019-02-13T02:04:24Z',
                    name: 'beforeSuiteTest',
                    'finished-at': '2019-02-13T02:04:24Z',
                    status: 'PASS',
                    'duration-ms': 0,
                  },
                  {
                    'reporter-output': '',
                    signature: 'afterSuiteTest()[pri:0, instance:io.choerodon.testng.demo.AnnotationTest@66d33a]',
                    'is-config': true,
                    'started-at': '2019-02-13T02:04:24Z',
                    name: 'afterSuiteTest',
                    'finished-at': '2019-02-13T02:04:24Z',
                    status: 'PASS',
                    'duration-ms': 1,
                  },
                ],
                name: 'io.choerodon.testng.demo.AnnotationTest',
              },
              {
                'test-method': [
                  {
                    'reporter-output': '',
                    signature: 'parallelTest2()[pri:0, instance:io.choerodon.testng.demo.ParallelTest@511baa65]',
                    'started-at': '2019-02-13T02:04:24Z',
                    name: 'parallelTest2',
                    'finished-at': '2019-02-13T02:04:24Z',
                    status: 'PASS',
                    'duration-ms': 1,
                  },
                  {
                    'reporter-output': '',
                    signature: 'parallelTest1()[pri:0, instance:io.choerodon.testng.demo.ParallelTest@511baa65]',
                    'started-at': '2019-02-13T02:04:24Z',
                    name: 'parallelTest1',
                    'finished-at': '2019-02-13T02:04:24Z',
                    status: 'PASS',
                    'duration-ms': 1,
                  },
                  {
                    'reporter-output': '',
                    signature: 'parallelTest3()[pri:0, instance:io.choerodon.testng.demo.ParallelTest@511baa65]',
                    'started-at': '2019-02-13T02:04:24Z',
                    name: 'parallelTest3',
                    'finished-at': '2019-02-13T02:04:24Z',
                    status: 'PASS',
                    'duration-ms': 0,
                  },
                ],
                name: 'io.choerodon.testng.demo.ParallelTest',
              },
            ],
            'duration-ms': 3,
          },
        ],
        'started-at': '2019-02-13T02:04:24Z',
        name: 'suite2',
        groups: {
          group: [
            {
              method: [
                {
                  signature: 'GroupTest.groupTest1()[pri:0, instance:io.choerodon.testng.demo.GroupTest@16c0663d]',
                  name: 'groupTest1',
                  class: 'io.choerodon.testng.demo.GroupTest',
                },
                {
                  signature: 'GroupTest.groupTest3(java.lang.String)[pri:0, instance:io.choerodon.testng.demo.GroupTest@16c0663d]',
                  name: 'groupTest3',
                  class: 'io.choerodon.testng.demo.GroupTest',
                },
              ],
              name: 'linux',
            },
            {
              method: {
                signature: 'GroupTest.groupTest1()[pri:0, instance:io.choerodon.testng.demo.GroupTest@16c0663d]',
                name: 'groupTest1',
                class: 'io.choerodon.testng.demo.GroupTest',
              },
              name: 'windows',
            },
          ],
        },
        'finished-at': '2019-02-13T02:04:24Z',
        'duration-ms': 24,
      },
      {
        test: {
          'started-at': '2019-02-13T02:04:23Z',
          name: 'testConfigure1',
          'finished-at': '2019-02-13T02:04:24Z',
          class: [
            {
              'test-method': [
                {
                  exception: {
                    'full-stacktrace': 'java.lang.AssertionError: 1 expectation failed.\nExpected status code <302> but was <502>.\n\nat sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)\nat sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)\nat sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)\nat java.lang.reflect.Constructor.newInstance(Constructor.java:423)\nat org.codehaus.groovy.reflection.CachedConstructor.invoke(CachedConstructor.java:83)\nat org.codehaus.groovy.reflection.CachedConstructor.doConstructorInvoke(CachedConstructor.java:77)\nat org.codehaus.groovy.runtime.callsite.ConstructorSite$ConstructorSiteNoUnwrap.callConstructor(ConstructorSite.java:84)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallConstructor(CallSiteArray.java:59)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callConstructor(AbstractCallSite.java:238)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callConstructor(AbstractCallSite.java:250)\nat io.restassured.internal.ResponseSpecificationImpl$HamcrestAssertionClosure.validate(ResponseSpecificationImpl.groovy:494)\nat io.restassured.internal.ResponseSpecificationImpl$HamcrestAssertionClosure$validate$1.call(Unknown Source)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCall(CallSiteArray.java:47)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.call(AbstractCallSite.java:116)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.call(AbstractCallSite.java:128)\nat io.restassured.internal.RequestSpecificationImpl.applyPathParamsAndSendRequest(RequestSpecificationImpl.groovy:1750)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.codehaus.groovy.reflection.CachedMethod.invoke(CachedMethod.java:98)\nat groovy.lang.MetaMethod.doMethodInvoke(MetaMethod.java:325)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1225)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1034)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:822)\nat io.restassured.internal.RequestSpecificationImpl.invokeMethod(RequestSpecificationImpl.groovy)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.call(PogoInterceptableSite.java:47)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.callCurrent(PogoInterceptableSite.java:57)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallCurrent(CallSiteArray.java:51)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:157)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:185)\nat io.restassured.internal.RequestSpecificationImpl.applyPathParamsAndSendRequest(RequestSpecificationImpl.groovy:1755)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.codehaus.groovy.reflection.CachedMethod.invoke(CachedMethod.java:98)\nat groovy.lang.MetaMethod.doMethodInvoke(MetaMethod.java:325)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1225)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1034)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:822)\nat io.restassured.internal.RequestSpecificationImpl.invokeMethod(RequestSpecificationImpl.groovy)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.call(PogoInterceptableSite.java:47)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.callCurrent(PogoInterceptableSite.java:57)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallCurrent(CallSiteArray.java:51)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:157)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:185)\nat io.restassured.internal.RequestSpecificationImpl.post(RequestSpecificationImpl.groovy:175)\nat io.restassured.internal.RequestSpecificationImpl.post(RequestSpecificationImpl.groovy)\nat io.choerodon.testng.config.utils.LoginUtil.login(LoginUtil.java:73)\nat io.choerodon.testng.config.TestBase.beforeClass(TestBase.java:21)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:124)\nat org.testng.internal.MethodInvocationHelper.invokeMethodConsideringTimeout(MethodInvocationHelper.java:59)\nat org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:455)\nat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:222)\nat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:142)\nat org.testng.internal.TestMethodWorker.invokeBeforeClassMethods(TestMethodWorker.java:168)\nat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:105)\nat org.testng.TestRunner.privateRun(TestRunner.java:648)\nat org.testng.TestRunner.run(TestRunner.java:505)\nat org.testng.SuiteRunner.runTest(SuiteRunner.java:455)\nat org.testng.SuiteRunner.runSequentially(SuiteRunner.java:450)\nat org.testng.SuiteRunner.privateRun(SuiteRunner.java:415)\nat org.testng.SuiteRunner.run(SuiteRunner.java:364)\nat org.testng.SuiteRunnerWorker.runSuite(SuiteRunnerWorker.java:52)\nat org.testng.SuiteRunnerWorker.run(SuiteRunnerWorker.java:84)\nat org.testng.TestNG.runSuitesSequentially(TestNG.java:1208)\nat org.testng.TestNG.runSuitesSequentially(TestNG.java:1204)\nat org.testng.TestNG.runSuitesLocally(TestNG.java:1137)\nat org.testng.TestNG.runSuites(TestNG.java:1049)\nat org.testng.TestNG.run(TestNG.java:1017)\nat io.choerodon.testng.config.TestExecution.main(TestExecution.java:32)\n',
                    message: '1 expectation failed.\nExpected status code <302> but was <502>.\n',
                    class: 'java.lang.AssertionError',
                  },
                  'reporter-output': '',
                  signature: 'beforeClass()[pri:0, instance:io.choerodon.testng.test.ApiTest@483bf400]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:23Z',
                  name: 'beforeClass',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'FAIL',
                  'duration-ms': 897,
                },
                {
                  exception: {
                    'full-stacktrace': 'java.lang.AssertionError: 1 expectation failed.\nExpected status code <302> but was <502>.\n\nat sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)\nat sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)\nat sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)\nat java.lang.reflect.Constructor.newInstance(Constructor.java:423)\nat org.codehaus.groovy.reflection.CachedConstructor.invoke(CachedConstructor.java:83)\nat org.codehaus.groovy.reflection.CachedConstructor.doConstructorInvoke(CachedConstructor.java:77)\nat org.codehaus.groovy.runtime.callsite.ConstructorSite$ConstructorSiteNoUnwrap.callConstructor(ConstructorSite.java:84)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallConstructor(CallSiteArray.java:59)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callConstructor(AbstractCallSite.java:238)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callConstructor(AbstractCallSite.java:250)\nat io.restassured.internal.ResponseSpecificationImpl$HamcrestAssertionClosure.validate(ResponseSpecificationImpl.groovy:494)\nat io.restassured.internal.ResponseSpecificationImpl$HamcrestAssertionClosure$validate$1.call(Unknown Source)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCall(CallSiteArray.java:47)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.call(AbstractCallSite.java:116)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.call(AbstractCallSite.java:128)\nat io.restassured.internal.RequestSpecificationImpl.applyPathParamsAndSendRequest(RequestSpecificationImpl.groovy:1750)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.codehaus.groovy.reflection.CachedMethod.invoke(CachedMethod.java:98)\nat groovy.lang.MetaMethod.doMethodInvoke(MetaMethod.java:325)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1225)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1034)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:822)\nat io.restassured.internal.RequestSpecificationImpl.invokeMethod(RequestSpecificationImpl.groovy)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.call(PogoInterceptableSite.java:47)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.callCurrent(PogoInterceptableSite.java:57)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallCurrent(CallSiteArray.java:51)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:157)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:185)\nat io.restassured.internal.RequestSpecificationImpl.applyPathParamsAndSendRequest(RequestSpecificationImpl.groovy:1755)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.codehaus.groovy.reflection.CachedMethod.invoke(CachedMethod.java:98)\nat groovy.lang.MetaMethod.doMethodInvoke(MetaMethod.java:325)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1225)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1034)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:822)\nat io.restassured.internal.RequestSpecificationImpl.invokeMethod(RequestSpecificationImpl.groovy)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.call(PogoInterceptableSite.java:47)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.callCurrent(PogoInterceptableSite.java:57)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallCurrent(CallSiteArray.java:51)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:157)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:185)\nat io.restassured.internal.RequestSpecificationImpl.post(RequestSpecificationImpl.groovy:175)\nat io.restassured.internal.RequestSpecificationImpl.post(RequestSpecificationImpl.groovy)\nat io.choerodon.testng.config.utils.LoginUtil.login(LoginUtil.java:73)\nat io.choerodon.testng.config.TestBase.beforeClass(TestBase.java:21)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:124)\nat org.testng.internal.MethodInvocationHelper.invokeMethodConsideringTimeout(MethodInvocationHelper.java:59)\nat org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:455)\nat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:222)\nat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:142)\nat org.testng.internal.TestMethodWorker.invokeBeforeClassMethods(TestMethodWorker.java:168)\nat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:105)\nat org.testng.TestRunner.privateRun(TestRunner.java:648)\nat org.testng.TestRunner.run(TestRunner.java:505)\nat org.testng.SuiteRunner.runTest(SuiteRunner.java:455)\nat org.testng.SuiteRunner.runSequentially(SuiteRunner.java:450)\nat org.testng.SuiteRunner.privateRun(SuiteRunner.java:415)\nat org.testng.SuiteRunner.run(SuiteRunner.java:364)\nat org.testng.SuiteRunnerWorker.runSuite(SuiteRunnerWorker.java:52)\nat org.testng.SuiteRunnerWorker.run(SuiteRunnerWorker.java:84)\nat org.testng.TestNG.runSuitesSequentially(TestNG.java:1208)\nat org.testng.TestNG.runSuitesSequentially(TestNG.java:1204)\nat org.testng.TestNG.runSuitesLocally(TestNG.java:1137)\nat org.testng.TestNG.runSuites(TestNG.java:1049)\nat org.testng.TestNG.run(TestNG.java:1017)\nat io.choerodon.testng.config.TestExecution.main(TestExecution.java:32)\n',
                    message: '1 expectation failed.\nExpected status code <302> but was <502>.\n',
                    class: 'java.lang.AssertionError',
                  },
                  'reporter-output': '',
                  signature: 'createIssue()[pri:0, instance:io.choerodon.testng.test.ApiTest@483bf400]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'createIssue',
                  description: '创建issue',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'SKIP',
                  'duration-ms': 0,
                },
              ],
              name: 'io.choerodon.testng.test.ApiTest',
            },
            {
              'test-method': [
                {
                  'reporter-output': '',
                  signature: 'beforeClass()[pri:0, instance:io.choerodon.testng.test.ApiTest2@21a06946]',
                  'is-config': true,
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'beforeClass',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'SKIP',
                  'duration-ms': 0,
                },
                {
                  exception: {
                    'full-stacktrace': 'java.lang.AssertionError: 1 expectation failed.\nExpected status code <302> but was <502>.\n\nat sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)\nat sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)\nat sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)\nat java.lang.reflect.Constructor.newInstance(Constructor.java:423)\nat org.codehaus.groovy.reflection.CachedConstructor.invoke(CachedConstructor.java:83)\nat org.codehaus.groovy.reflection.CachedConstructor.doConstructorInvoke(CachedConstructor.java:77)\nat org.codehaus.groovy.runtime.callsite.ConstructorSite$ConstructorSiteNoUnwrap.callConstructor(ConstructorSite.java:84)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallConstructor(CallSiteArray.java:59)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callConstructor(AbstractCallSite.java:238)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callConstructor(AbstractCallSite.java:250)\nat io.restassured.internal.ResponseSpecificationImpl$HamcrestAssertionClosure.validate(ResponseSpecificationImpl.groovy:494)\nat io.restassured.internal.ResponseSpecificationImpl$HamcrestAssertionClosure$validate$1.call(Unknown Source)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCall(CallSiteArray.java:47)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.call(AbstractCallSite.java:116)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.call(AbstractCallSite.java:128)\nat io.restassured.internal.RequestSpecificationImpl.applyPathParamsAndSendRequest(RequestSpecificationImpl.groovy:1750)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.codehaus.groovy.reflection.CachedMethod.invoke(CachedMethod.java:98)\nat groovy.lang.MetaMethod.doMethodInvoke(MetaMethod.java:325)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1225)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1034)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:822)\nat io.restassured.internal.RequestSpecificationImpl.invokeMethod(RequestSpecificationImpl.groovy)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.call(PogoInterceptableSite.java:47)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.callCurrent(PogoInterceptableSite.java:57)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallCurrent(CallSiteArray.java:51)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:157)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:185)\nat io.restassured.internal.RequestSpecificationImpl.applyPathParamsAndSendRequest(RequestSpecificationImpl.groovy:1755)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.codehaus.groovy.reflection.CachedMethod.invoke(CachedMethod.java:98)\nat groovy.lang.MetaMethod.doMethodInvoke(MetaMethod.java:325)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1225)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:1034)\nat groovy.lang.MetaClassImpl.invokeMethod(MetaClassImpl.java:822)\nat io.restassured.internal.RequestSpecificationImpl.invokeMethod(RequestSpecificationImpl.groovy)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.call(PogoInterceptableSite.java:47)\nat org.codehaus.groovy.runtime.callsite.PogoInterceptableSite.callCurrent(PogoInterceptableSite.java:57)\nat org.codehaus.groovy.runtime.callsite.CallSiteArray.defaultCallCurrent(CallSiteArray.java:51)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:157)\nat org.codehaus.groovy.runtime.callsite.AbstractCallSite.callCurrent(AbstractCallSite.java:185)\nat io.restassured.internal.RequestSpecificationImpl.post(RequestSpecificationImpl.groovy:175)\nat io.restassured.internal.RequestSpecificationImpl.post(RequestSpecificationImpl.groovy)\nat io.choerodon.testng.config.utils.LoginUtil.login(LoginUtil.java:73)\nat io.choerodon.testng.config.TestBase.beforeClass(TestBase.java:21)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\nat java.lang.reflect.Method.invoke(Method.java:498)\nat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:124)\nat org.testng.internal.MethodInvocationHelper.invokeMethodConsideringTimeout(MethodInvocationHelper.java:59)\nat org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:455)\nat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:222)\nat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:142)\nat org.testng.internal.TestMethodWorker.invokeBeforeClassMethods(TestMethodWorker.java:168)\nat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:105)\nat org.testng.TestRunner.privateRun(TestRunner.java:648)\nat org.testng.TestRunner.run(TestRunner.java:505)\nat org.testng.SuiteRunner.runTest(SuiteRunner.java:455)\nat org.testng.SuiteRunner.runSequentially(SuiteRunner.java:450)\nat org.testng.SuiteRunner.privateRun(SuiteRunner.java:415)\nat org.testng.SuiteRunner.run(SuiteRunner.java:364)\nat org.testng.SuiteRunnerWorker.runSuite(SuiteRunnerWorker.java:52)\nat org.testng.SuiteRunnerWorker.run(SuiteRunnerWorker.java:84)\nat org.testng.TestNG.runSuitesSequentially(TestNG.java:1208)\nat org.testng.TestNG.runSuitesSequentially(TestNG.java:1204)\nat org.testng.TestNG.runSuitesLocally(TestNG.java:1137)\nat org.testng.TestNG.runSuites(TestNG.java:1049)\nat org.testng.TestNG.run(TestNG.java:1017)\nat io.choerodon.testng.config.TestExecution.main(TestExecution.java:32)\n',
                    message: '1 expectation failed.\nExpected status code <302> but was <502>.\n',
                    class: 'java.lang.AssertionError',
                  },
                  'reporter-output': '',
                  signature: 'querySelf()[pri:0, instance:io.choerodon.testng.test.ApiTest2@21a06946]',
                  'started-at': '2019-02-13T02:04:24Z',
                  name: 'querySelf',
                  description: '登录后查询用户',
                  'finished-at': '2019-02-13T02:04:24Z',
                  status: 'SKIP',
                  'duration-ms': 0,
                },
              ],
              name: 'io.choerodon.testng.test.ApiTest2',
            },
          ],
          'duration-ms': 908,
        },
        'started-at': '2019-02-13T02:04:23Z',
        name: 'suite1',
        groups: '',
        'finished-at': '2019-02-13T02:04:24Z',
        'duration-ms': 908,
      },
      {
        'started-at': '2019-02-13T02:04:24Z',
        name: '-',
        groups: '',
        'finished-at': '2019-02-13T02:04:24Z',
        'duration-ms': 0,
      },
    ],
    failed: 0,
    passed: 22,
    skipped: 2,
  },
};
class TestNGReport extends Component {
  // 统计suite中所有test的通过状况
  calculateTestByTest = (tests) => {
    let pass = 0;
    let skip = 0;
    let fail = 0;
    let all = 0;
    tests.forEach((test) => {
      // console.log(TestClass);
      all += this.calculateTestByClass(test.class).all;
      pass += this.calculateTestByClass(test.class).pass;
      skip += this.calculateTestByClass(test.class).skip;
      fail += this.calculateTestByClass(test.class).fail;      
    });
    tests.push({
      name: '总计',    
      pass,
      skip,
      fail,
      passPercent: pass / all * 100,
      class: { 'test-method': [] },
    });    
  }

  // 统计一个test中的所有class的方法通过情况
  calculateTestByClass = (classes) => {
    const TestClasses = classes instanceof Array ? classes : [classes];
    let pass = 0;
    let skip = 0;
    let fail = 0;
    let all = 0;
    TestClasses.forEach((TestClass) => {
      // console.log(TestClass);
      all += TestClass['test-method'].length;
      pass += TestClass['test-method'].filter(method => method.status === 'PASS').length;
      skip += TestClass['test-method'].filter(method => method.status === 'SKIP').length;
      fail += TestClass['test-method'].filter(method => method.status === 'FAIL').length;
    });
    return {
      pass, skip, fail, all, passPercent: pass / all * 100,
    };
  }

  groupClassByStatus = (classes) => {
    const TestClasses = classes instanceof Array ? classes : [classes];

    const getTestByStatus = (type) => {
      const Classes = JSON.parse(JSON.stringify(TestClasses));
      Classes.forEach((TestClass) => {
        const len = TestClass['test-method'].filter(method => method.status === type).length;
        if (len === 0) {
          TestClass.empty = true;
        }
        TestClass['test-method'] = TestClass['test-method'].filter(method => method.status === type);
      });

      return Classes.filter(Class => !Class.empty);
    };
    const PassClasses = getTestByStatus('PASS');
    const SkipClasses = getTestByStatus('SKIP');
    const FailClasses = getTestByStatus('FAIL');
    return { PassClasses, SkipClasses, FailClasses };
  }

  render() {
    // const { data } = this.props;
    const columns = [
      { title: '测试', dataIndex: 'name', key: 'name' },
      {
        title: '持续时间', dataIndex: 'duration-ms', key: 'duration-ms', render: duration => duration !== undefined && `${duration}ms`,
      },
      {
        title:
  <span>
    <Badge status="success" />
            通过
  </span>,
        dataIndex: 'pass',
        key: 'pass',
        render: (pass, record) => record.pass || this.calculateTestByClass(record.class).pass,
      },
      {
        title:
  <span>
    <Badge status="warning" />
            跳过
  </span>,
        dataIndex: 'skip',
        key: 'skip',
        render: (pass, record) => record.skip || this.calculateTestByClass(record.class).skip,
      },
      {
        title:
  <span>
    <Badge status="error" />
            失败
  </span>,
        dataIndex: 'fail',
        key: 'fail',
        render: (pass, record) => record.fail || this.calculateTestByClass(record.class).fail,
      },
      {
        title: '通过率',
        dataIndex: 'passPercent',
        key: 'passPercent',
        render: (pass, record) => `${record.passPercent || this.calculateTestByClass(record.class).passPercent}%`,
      },
    ];
    const suites = data['testng-results'].suite.filter(suite => suite.test);
    const log = data['reporter-output'];
    const InnerTable = (TestClass) => {
      const { name } = TestClass;
      const innerColumns = [
        {
          title: name, dataIndex: 'name', key: 'name', colSpan: 3,
        },
        {
          title: '时长',
          dataIndex: 'duration-ms',
          key: 'duration-ms',
          colSpan: 0,
          render: duration => `${duration}ms`,
        },
        {
          title: 'log',
          key: 'log',
          colSpan: 0,
          render: (recordInner) => {
            const { params, exception } = recordInner;
            return (
              <div>
                {params && <div>{`[DATA] ${toArray(params.param).map(param => param.value).join(',')}`}</div>}
                {exception && <div style={{ whiteSpace: 'pre-wrap', color: '#3F51B5' }}>{exception.message}</div>}
                {exception && <div style={{ whiteSpace: 'pre-wrap' }}>{exception['full-stacktrace']}</div>}
              </div>
            );
          },
        },
      ];
      const status = this.calculateTestByClass(TestClass).passPercent;
      return (
        <Table          
          filterBar={false}
          columns={innerColumns}
          dataSource={TestClass['test-method']}
          pagination={false}
        />
      );
    };
    const expandedRowRender = (record) => {
      const TestClasses = record.class instanceof Array ? record.class : [record.class];
      const { PassClasses, SkipClasses, FailClasses } = this.groupClassByStatus(record.class);
      return (
        <div>
          {/* 通过 */}
          {PassClasses.length > 0
            && (
              <div>
                <div className="c7ntest-table-title c7ntest-table-header-pass">
                  <Badge status="success" />
                  测试通过
                </div>
                {PassClasses.map(InnerTable)}
              </div>
            )}
          {/* 跳过 */}
          {SkipClasses.length > 0
            && (
              <div>
                <div className="c7ntest-table-title c7ntest-table-header-skip">
                  <Badge status="warning" />
                  测试跳过
                </div>
                {SkipClasses.map(InnerTable)}
              </div>
            )}
          {/* 失败 */}
          {FailClasses.length > 0
            && (
              <div>
                <div className="c7ntest-table-title c7ntest-table-header-failed">
                  <Badge status="error" />
                  测试失败
                </div>
                {FailClasses.map(InnerTable)}
              </div>
            )}
        </div>
      );
    };
    return (
      <div className="c7ntest-TestNGReport">
        TestNGReport
        <Tabs defaultActiveKey="1">
          <TabPane tab="总览" key="1">
            <section style={{ display: 'flex', alignItems: 'center' }}>
              筛选：
              <Select
                allowClear
                className="c7ntest-select"
                placeholder="Suite"
              // style={{ width: 200 }}
              >
                <Option key="1" value="1">
                  suite
                </Option>
              </Select>
            </section>
            <section>
              {
                suites.map((suite) => {
                  const tests = suite.test instanceof Array ? suite.test : [suite.test];
                  this.calculateTestByTest(tests);
                  return (
                    <Table
                      rowClassName={(record, index) => (index === tests.length - 1 ? 'c7ntest-table-total' : '')}
                      title={() => <div style={{ paddingLeft: 57 }}>{suite.name}</div>}
                      filterBar={false}
                      columns={columns}
                      expandedRowRender={expandedRowRender}
                      dataSource={tests}
                    />
                  );
                })
              }
            </section>
          </TabPane>
          <TabPane tab="日志" key="2">
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {log}
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

TestNGReport.propTypes = {

};

export default TestNGReport;
