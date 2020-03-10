//
//  RNNewRelic.m
//  RNNewRelic
//
//  Created by Daniel Zlotin on 26/04/2016.
//  Copyright © 2016 Wix.com. All rights reserved.
//

#import "RNNewRelic.h"

@implementation RNNewRelic

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setUserId: (NSString*)id){
    [NewRelicAgent setUserId:id];
}

RCT_EXPORT_METHOD(setAttribute: (NSString*)name: (NSString*)value){
    [NewRelicAgent setAttribute:name value:value];
}

RCT_EXPORT_METHOD(removeAttribute: (NSString*)attributeName){
    [NewRelicAgent removeAttribute:attributeName];
}

RCT_EXPORT_METHOD(recordCustomEventWithName: (NSString*)eventType: (NSString*)eventName :(NSDictionary*)args){
    [NewRelicAgent recordCustomEvent:eventType name:eventName attributes:args];
}

RCT_EXPORT_METHOD(recordCustomEvent: (NSString*)eventType: (NSDictionary*)args){
    [NewRelicAgent recordCustomEvent:eventType attributes:args];
}

// Logs a message to the native console
RCT_EXPORT_METHOD(nativeLog:(NSString *)msg){
    NSLog(@"%@", msg);
}

@end
